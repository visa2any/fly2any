'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Contact, 
  Segment, 
  SegmentCondition, 
  segmentContacts,
  formatNumber 
} from '@/lib/email-marketing/utils';
import { emailMarketingAPI } from '@/lib/email-marketing/api';

interface SegmentationEngineProps {
  contacts?: Contact[];
  onSegmentCreate?: (segment: Segment) => void;
  onSegmentSelect?: (segment: Segment) => void;
  className?: string;
}

interface ConditionBuilder {
  id: string;
  field: string;
  operator: string;
  value: any;
  type: 'text' | 'number' | 'date' | 'boolean' | 'array';
}

const fieldOptions = [
  { value: 'email', label: 'Email', type: 'text' },
  { value: 'nome', label: 'Nome', type: 'text' },
  { value: 'segmento', label: 'Segmento', type: 'text' },
  { value: 'city', label: 'Cidade', type: 'text' },
  { value: 'phone', label: 'Telefone', type: 'text' },
  { value: 'tags', label: 'Tags', type: 'array' },
  { value: 'engagementScore', label: 'Score de Engajamento', type: 'number' },
  { value: 'totalEmailsSent', label: 'Total de Emails Enviados', type: 'number' },
  { value: 'totalOpens', label: 'Total de Aberturas', type: 'number' },
  { value: 'totalClicks', label: 'Total de Cliques', type: 'number' },
  { value: 'lastEmailSent', label: 'Último Email Enviado', type: 'date' },
  { value: 'subscribedAt', label: 'Data de Inscrição', type: 'date' }
];

const operatorOptions = {
  text: [
    { value: 'equals', label: 'é igual a' },
    { value: 'not_equals', label: 'não é igual a' },
    { value: 'contains', label: 'contém' },
    { value: 'not_contains', label: 'não contém' },
    { value: 'starts_with', label: 'começa com' },
    { value: 'ends_with', label: 'termina com' }
  ],
  number: [
    { value: 'equals', label: 'é igual a' },
    { value: 'not_equals', label: 'não é igual a' },
    { value: 'greater_than', label: 'é maior que' },
    { value: 'less_than', label: 'é menor que' }
  ],
  date: [
    { value: 'equals', label: 'é igual a' },
    { value: 'not_equals', label: 'não é igual a' },
    { value: 'greater_than', label: 'é depois de' },
    { value: 'less_than', label: 'é antes de' }
  ],
  array: [
    { value: 'contains', label: 'contém' },
    { value: 'not_contains', label: 'não contém' },
    { value: 'in', label: 'está em' },
    { value: 'not_in', label: 'não está em' }
  ],
  boolean: [
    { value: 'equals', label: 'é igual a' },
    { value: 'not_equals', label: 'não é igual a' }
  ]
};

export default function SegmentationEngine({ 
  contacts = [], 
  onSegmentCreate,
  onSegmentSelect,
  className = "" 
}: SegmentationEngineProps) {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');
  const [conditions, setConditions] = useState<ConditionBuilder[]>([]);
  const [previewContacts, setPreviewContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load segments on mount
  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    setLoading(true);
    try {
      const response = await emailMarketingAPI.getSegments();
      if (response.success && response.data) {
        setSegments(response.data);
      }
    } catch (error) {
      console.error('Error loading segments:', error);
    }
    setLoading(false);
  };

  // Add new condition
  const addCondition = () => {
    const newCondition: ConditionBuilder = {
      id: Date.now().toString(),
      field: 'email',
      operator: 'contains',
      value: '',
      type: 'text'
    };
    setConditions([...conditions, newCondition]);
  };

  // Remove condition
  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  // Update condition
  const updateCondition = (id: string, updates: Partial<ConditionBuilder>) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  // Preview segment
  const previewSegment = useMemo(() => {
    if (conditions.length === 0) return [];
    
    const segmentConditions: SegmentCondition[] = conditions.map(c => ({
      field: c.field,
      operator: c.operator as any,
      value: c.type === 'number' ? Number(c.value) : c.value,
      type: c.type
    }));
    
    return segmentContacts(contacts, segmentConditions);
  }, [contacts, conditions]);

  // Create segment
  const createSegment = async () => {
    if (!segmentName.trim() || conditions.length === 0) return;
    
    setLoading(true);
    try {
      const segmentData = {
        name: segmentName.trim(),
        description: segmentDescription.trim(),
        conditions: conditions.map(c => ({
          field: c.field,
          operator: c.operator,
          value: c.type === 'number' ? Number(c.value) : c.value
        }))
      };
      
      const response = await emailMarketingAPI.createSegment(segmentData);
      
      if (response.success && response.data) {
        setSegments([...segments, response.data]);
        onSegmentCreate?.(response.data);
        
        // Reset form
        setSegmentName('');
        setSegmentDescription('');
        setConditions([]);
        setShowBuilder(false);
      }
    } catch (error) {
      console.error('Error creating segment:', error);
    }
    setLoading(false);
  };

  // Delete segment
  const deleteSegment = async (segmentId: string) => {
    if (!confirm('Tem certeza que deseja excluir este segmento?')) return;
    
    setLoading(true);
    try {
      const response = await emailMarketingAPI.deleteSegment(segmentId);
      if (response.success) {
        setSegments(segments.filter(s => s.id !== segmentId));
        if (selectedSegment?.id === segmentId) {
          setSelectedSegment(null);
        }
      }
    } catch (error) {
      console.error('Error deleting segment:', error);
    }
    setLoading(false);
  };

  // Filter segments by search
  const filteredSegments = segments.filter(segment =>
    segment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (segment.description && segment.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Predefined segments
  const predefinedSegments = [
    {
      name: 'Altamente Engajados',
      description: 'Contatos com alta taxa de abertura',
      conditions: [{ field: 'engagementScore', operator: 'greater_than', value: 70 }],
      icon: '⭐'
    },
    {
      name: 'Inativos',
      description: 'Não abriram emails há mais de 30 dias',
      conditions: [{ field: 'totalOpens', operator: 'equals', value: 0 }],
      icon: '😴'
    },
    {
      name: 'Novos Assinantes',
      description: 'Inscritos nos últimos 7 dias',
      conditions: [{ field: 'subscribedAt', operator: 'greater_than', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }],
      icon: '🎉'
    },
    {
      name: 'Clicadores Ativos',
      description: 'Clicaram em pelo menos 3 emails',
      conditions: [{ field: 'totalClicks', operator: 'greater_than', value: 3 }],
      icon: '👆'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎯 Engine de Segmentação Inteligente
              </h2>
              <p className="text-gray-600">
                Crie segmentos avançados com múltiplas condições e filtros inteligentes
              </p>
            </div>
            <button
              onClick={() => setShowBuilder(!showBuilder)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg font-semibold"
            >
              ➕ Criar Segmento
            </button>
          </div>
          
          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar segmentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Segment Builder */}
      {showBuilder && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🛠️ Construtor de Segmento
            </h3>
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Segmento *
                </label>
                <input
                  type="text"
                  value={segmentName}
                  onChange={(e) => setSegmentName(e.target.value)}
                  placeholder="ex: Clientes VIP"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={segmentDescription}
                  onChange={(e) => setSegmentDescription(e.target.value)}
                  placeholder="Descreva este segmento..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conditions */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Condições do Segmento
                </label>
                <button
                  onClick={addCondition}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  ➕ Adicionar Condição
                </button>
              </div>
              
              <div className="space-y-3">
                {conditions.map((condition, index) => (
                  <div key={condition.id} className="flex gap-3 items-end p-4 bg-gray-50 rounded-lg">
                    {index > 0 && (
                      <div className="text-sm font-medium text-gray-500 mb-3">E</div>
                    )}
                    
                    {/* Field */}
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Campo
                      </label>
                      <select
                        value={condition.field}
                        onChange={(e) => {
                          const field = fieldOptions.find(f => f.value === e.target.value);
                          updateCondition(condition.id, {
                            field: e.target.value,
                            type: field?.type as any || 'text'
                          });
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {fieldOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Operator */}
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Operador
                      </label>
                      <select
                        value={condition.operator}
                        onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {operatorOptions[condition.type]?.map((option: { value: string; label: string }) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Value */}
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Valor
                      </label>
                      {condition.type === 'date' ? (
                        <input
                          type="date"
                          value={condition.value}
                          onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : condition.type === 'number' ? (
                        <input
                          type="number"
                          value={condition.value}
                          onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      ) : (
                        <input
                          type="text"
                          value={condition.value}
                          onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeCondition(condition.id)}
                      className="text-red-500 hover:text-red-700 text-lg mb-2"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                
                {conditions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-2xl mb-2">🎯</div>
                    <p>Adicione condições para criar seu segmento personalizado</p>
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            {previewSegment.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  📊 Pré-visualização do Segmento
                </h4>
                <p className="text-blue-700">
                  Este segmento incluirá <strong>{formatNumber(previewSegment.length)}</strong> contatos
                  de um total de {formatNumber(contacts.length)} contatos.
                </p>
                
                {previewSegment.slice(0, 3).length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-blue-600 mb-2">Exemplo de contatos:</p>
                    <div className="space-y-1">
                      {previewSegment.slice(0, 3).map((contact, index) => (
                        <div key={index} className="text-sm text-blue-800">
                          • {contact.nome} ({contact.email})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={createSegment}
                disabled={!segmentName.trim() || conditions.length === 0 || loading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? '🔄 Criando...' : '✅ Criar Segmento'}
              </button>
              <button
                onClick={() => {
                  setShowBuilder(false);
                  setSegmentName('');
                  setSegmentDescription('');
                  setConditions([]);
                }}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Predefined Segments */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            ⚡ Segmentos Predefinidos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {predefinedSegments.map((segment) => {
              const matchingContacts = segmentContacts(
                contacts, 
                segment.conditions as SegmentCondition[]
              );
              
              return (
                <div
                  key={segment.name}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                  onClick={() => {
                    // Apply predefined segment as conditions
                    const newConditions: ConditionBuilder[] = segment.conditions.map((cond, index) => ({
                      id: (Date.now() + index).toString(),
                      field: cond.field,
                      operator: cond.operator,
                      value: cond.value,
                      type: fieldOptions.find(f => f.value === cond.field)?.type as any || 'text'
                    }));
                    setConditions(newConditions);
                    setSegmentName(segment.name);
                    setSegmentDescription(segment.description);
                    setShowBuilder(true);
                  }}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">{segment.icon}</div>
                    <div className="font-semibold text-gray-900 text-sm mb-1">
                      {segment.name}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {segment.description}
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {formatNumber(matchingContacts.length)}
                    </div>
                    <div className="text-xs text-gray-500">contatos</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Existing Segments */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            📋 Segmentos Criados ({formatNumber(filteredSegments.length)})
          </h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-2xl mb-2">⏳</div>
              <p>Carregando segmentos...</p>
            </div>
          ) : filteredSegments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <p>Nenhum segmento encontrado</p>
              <p className="text-sm">Crie seu primeiro segmento personalizado!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSegments.map((segment) => (
                <div
                  key={segment.id}
                  className={`p-4 border rounded-lg transition-all cursor-pointer ${
                    selectedSegment?.id === segment.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                  onClick={() => {
                    setSelectedSegment(segment);
                    onSegmentSelect?.(segment);
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">{segment.name}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSegment(segment.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  {segment.description && (
                    <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {segment.conditions.length} condições
                    </span>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">
                        {formatNumber(segment.contactCount)}
                      </div>
                      <div className="text-xs text-gray-500">contatos</div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-400">
                    Criado em {new Date(segment.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}