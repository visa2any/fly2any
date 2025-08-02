'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ResponseTemplate {
  id: string;
  name: string;
  content: string;
  category: 'greeting' | 'booking' | 'support' | 'closing' | 'follow_up' | 'emergency';
  channel: 'all' | 'whatsapp' | 'email' | 'webchat' | 'phone';
  variables: string[];
  usage_count: number;
  created_at: Date;
  updated_at: Date;
}

interface ResponseTemplatesProps {
  onTemplateSelect: (template: ResponseTemplate) => void;
  currentChannel?: string;
}

const ResponseTemplates: React.FC<ResponseTemplatesProps> = ({ 
  onTemplateSelect, 
  currentChannel = 'all' 
}) => {
  const [templates, setTemplates] = useState<ResponseTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<ResponseTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'greeting' as ResponseTemplate['category'],
    channel: 'all' as ResponseTemplate['channel']
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory, currentChannel]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      
      // Dados mock para templates - em produção viria da API
      const mockTemplates: ResponseTemplate[] = [
        {
          id: '1',
          name: 'Saudação WhatsApp',
          content: 'Olá {nome}! 👋\n\nObrigado por entrar em contato com a Fly2Any! Como posso ajudá-lo hoje?',
          category: 'greeting',
          channel: 'whatsapp',
          variables: ['nome'],
          usage_count: 245,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-15')
        },
        {
          id: '2',
          name: 'Confirmação de Reserva',
          content: 'Perfeito! Sua reserva para {destino} foi confirmada! ✈️\n\nDetalhes:\n- Data: {data}\n- Valor: {valor}\n- Código: {codigo}\n\nEm breve você receberá todos os documentos por email.',
          category: 'booking',
          channel: 'all',
          variables: ['destino', 'data', 'valor', 'codigo'],
          usage_count: 189,
          created_at: new Date('2024-01-05'),
          updated_at: new Date('2024-01-20')
        },
        {
          id: '3',
          name: 'Suporte Técnico',
          content: 'Entendo sua situação. Vou transferir você para nosso suporte especializado que resolverá isso rapidamente. ⚡\n\nTempo estimado: 5 minutos\nProtocolo: {protocolo}',
          category: 'support',
          channel: 'all',
          variables: ['protocolo'],
          usage_count: 67,
          created_at: new Date('2024-01-10'),
          updated_at: new Date('2024-01-18')
        },
        {
          id: '4',
          name: 'Fora do Horário',
          content: 'Obrigado pela sua mensagem! 🌙\n\nNo momento estamos fora do horário de atendimento (09h às 18h).\n\nRetornaremos primeira hora na manhã. Para emergências, ligue: (11) 9999-9999',
          category: 'closing',
          channel: 'whatsapp',
          variables: [],
          usage_count: 312,
          created_at: new Date('2024-01-03'),
          updated_at: new Date('2024-01-16')
        },
        {
          id: '5',
          name: 'Follow-up Pós-Viagem',
          content: 'Oi {nome}! Espero que tenha aproveitado muito {destino}! 🏖️\n\nPoderia nos contar como foi sua experiência? Sua opinião é muito importante para nós!\n\nJá está pensando na próxima aventura? 😉',
          category: 'follow_up',
          channel: 'all',
          variables: ['nome', 'destino'],
          usage_count: 89,
          created_at: new Date('2024-01-12'),
          updated_at: new Date('2024-01-19')
        },
        {
          id: '6',
          name: 'Emergência de Viagem',
          content: '🚨 EMERGÊNCIA IDENTIFICADA\n\nOlá {nome}, identificamos uma situação que requer atenção imediata:\n\n{situacao}\n\nJá estamos trabalhando na solução. Você receberá atualizações a cada 30 minutos.\n\nContato direto: (11) 9999-9999',
          category: 'emergency',
          channel: 'all',
          variables: ['nome', 'situacao'],
          usage_count: 12,
          created_at: new Date('2024-01-08'),
          updated_at: new Date('2024-01-17')
        }
      ];

      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filtrar por canal
    if (currentChannel !== 'all') {
      filtered = filtered.filter(template => 
        template.channel === 'all' || template.channel === currentChannel
      );
    }

    // Filtrar por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleTemplateSelect = (template: ResponseTemplate) => {
    // Incrementar contador de uso
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usage_count: t.usage_count + 1 }
        : t
    ));
    
    onTemplateSelect(template);
  };

  const handleCreateTemplate = () => {
    if (!formData.name || !formData.content) return;

    const newTemplate: ResponseTemplate = {
      id: Date.now().toString(),
      name: formData.name,
      content: formData.content,
      category: formData.category,
      channel: formData.channel,
      variables: extractVariables(formData.content),
      usage_count: 0,
      created_at: new Date(),
      updated_at: new Date()
    };

    setTemplates(prev => [newTemplate, ...prev]);
    setFormData({
      name: '',
      content: '',
      category: 'greeting',
      channel: 'all'
    });
    setShowCreateForm(false);
  };

  const extractVariables = (content: string): string[] => {
    const regex = /\{([^}]+)\}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'greeting': return '👋';
      case 'booking': return '✈️';
      case 'support': return '🛠️';
      case 'closing': return '🌙';
      case 'follow_up': return '📞';
      case 'emergency': return '🚨';
      default: return '📝';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'greeting': return 'bg-blue-100 text-blue-800';
      case 'booking': return 'bg-green-100 text-green-800';
      case 'support': return 'bg-orange-100 text-orange-800';
      case 'closing': return 'bg-purple-100 text-purple-800';
      case 'follow_up': return 'bg-yellow-100 text-yellow-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = [
    { value: 'all', label: 'Todas' },
    { value: 'greeting', label: 'Saudação' },
    { value: 'booking', label: 'Reservas' },
    { value: 'support', label: 'Suporte' },
    { value: 'closing', label: 'Encerramento' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'emergency', label: 'Emergência' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Templates de Resposta</h3>
        <Button 
          onClick={() => setShowCreateForm(true)}
          size="sm"
          className="text-sm"
        >
          ➕ Novo Template
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Input
          placeholder="Buscar templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {filteredTemplates.map(template => (
          <div
            key={template.id}
            onClick={() => handleTemplateSelect(template)}
            className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCategoryIcon(template.category)}</span>
                <h4 className="font-medium text-sm">{template.name}</h4>
              </div>
              <Badge className={`text-xs ${getCategoryColor(template.category)}`}>
                {template.category}
              </Badge>
            </div>
            
            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
              {template.content.substring(0, 100)}...
            </p>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <span>📊 {template.usage_count} usos</span>
                {template.variables.length > 0 && (
                  <span>🔤 {template.variables.length} variáveis</span>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {template.channel}
              </Badge>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum template encontrado</p>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Criar Novo Template</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Template</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Saudação WhatsApp"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value as ResponseTemplate['category']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="greeting">Saudação</option>
                  <option value="booking">Reservas</option>
                  <option value="support">Suporte</option>
                  <option value="closing">Encerramento</option>
                  <option value="follow_up">Follow-up</option>
                  <option value="emergency">Emergência</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Canal</label>
                <select 
                  value={formData.channel}
                  onChange={(e) => setFormData({...formData, channel: e.target.value as ResponseTemplate['channel']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="all">Todos os canais</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="webchat">Chat Web</option>
                  <option value="phone">Telefone</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Conteúdo</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Use {variavel} para campos dinâmicos"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dica: Use {`{nome}`}, {`{destino}`}, {`{data}`} para campos dinâmicos
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={handleCreateTemplate}
                disabled={!formData.name || !formData.content}
                className="flex-1"
              >
                Criar Template
              </Button>
              <Button 
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ResponseTemplates;