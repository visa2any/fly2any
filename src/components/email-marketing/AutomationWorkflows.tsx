'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AutomationWorkflow,
  WorkflowTrigger,
  WorkflowAction,
  formatDateShort
} from '@/lib/email-marketing/utils';
import { emailMarketingAPI } from '@/lib/email-marketing/api';

interface AutomationWorkflowsProps {
  className?: string;
  onWorkflowSelect?: (workflow: AutomationWorkflow) => void;
}

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition';
  data: any;
  position: { x: number; y: number };
}

interface WorkflowConnection {
  from: string;
  to: string;
}

const triggerTypes = [
  { value: 'contact_added', label: 'Contato Adicionado', icon: '👤', description: 'Quando um novo contato é adicionado' },
  { value: 'email_opened', label: 'Email Aberto', icon: '👀', description: 'Quando um email é aberto' },
  { value: 'email_clicked', label: 'Link Clicado', icon: '👆', description: 'Quando um link é clicado' },
  { value: 'date_based', label: 'Data Específica', icon: '📅', description: 'Em uma data/hora específica' },
  { value: 'tag_added', label: 'Tag Adicionada', icon: '🏷️', description: 'Quando uma tag é adicionada' },
  { value: 'segment_joined', label: 'Segmento Entrou', icon: '🎯', description: 'Quando entra em um segmento' }
];

const actionTypes = [
  { value: 'send_email', label: 'Enviar Email', icon: '📧', description: 'Enviar um email específico' },
  { value: 'add_tag', label: 'Adicionar Tag', icon: '🏷️', description: 'Adicionar tag ao contato' },
  { value: 'remove_tag', label: 'Remover Tag', icon: '🏷️', description: 'Remover tag do contato' },
  { value: 'move_to_segment', label: 'Mover para Segmento', icon: '🎯', description: 'Mover para outro segmento' },
  { value: 'wait', label: 'Aguardar', icon: '⏰', description: 'Aguardar tempo específico' },
  { value: 'webhook', label: 'Webhook', icon: '🔗', description: 'Chamar URL externa' }
];

export default function AutomationWorkflows({
  className = "",
  onWorkflowSelect
}: AutomationWorkflowsProps) {
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<AutomationWorkflow | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([]);
  const [loading, setLoading] = useState(false);
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);

  // Load workflows
  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const response = await emailMarketingAPI.getWorkflows();
      if (response.success && response.data) {
        setWorkflows(response.data);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
    setLoading(false);
  };

  // Add node to canvas
  const addNode = useCallback((type: string, nodeType: 'trigger' | 'action' | 'condition', position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: Date.now().toString(),
      type: nodeType,
      data: { type, config: {} },
      position
    };
    setNodes(prev => [...prev, newNode]);
  }, []);

  // Remove node
  const removeNode = (nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.from !== nodeId && c.to !== nodeId));
  };

  // Update node data
  const updateNode = (nodeId: string, data: any) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n));
  };

  // Create workflow
  const createWorkflow = async () => {
    if (!workflowName.trim() || nodes.length === 0) return;

    setLoading(true);
    try {
      // Convert nodes to workflow format
      const triggerNode = nodes.find(n => n.type === 'trigger');
      const actionNodes = nodes.filter(n => n.type === 'action');

      if (!triggerNode) {
        alert('Adicione um gatilho para a automação');
        setLoading(false);
        return;
      }

      const workflowData = {
        name: workflowName.trim(),
        description: workflowDescription.trim(),
        trigger: {
          type: triggerNode.data.type,
          config: triggerNode.data.config
        },
        actions: actionNodes.map(node => ({
          type: node.data.type,
          config: node.data.config,
          delay: node.data.delay || 0
        }))
      };

      const response = await emailMarketingAPI.createWorkflow(workflowData);
      if (response.success && response.data) {
        setWorkflows([...workflows, response.data]);
        // Reset form
        setWorkflowName('');
        setWorkflowDescription('');
        setNodes([]);
        setConnections([]);
        setShowBuilder(false);
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
    setLoading(false);
  };

  // Toggle workflow status
  const toggleWorkflow = async (workflowId: string, isActive: boolean) => {
    setLoading(true);
    try {
      if (isActive) {
        await emailMarketingAPI.activateWorkflow(workflowId);
      } else {
        await emailMarketingAPI.deactivateWorkflow(workflowId);
      }
      await loadWorkflows();
    } catch (error) {
      console.error('Error toggling workflow:', error);
    }
    setLoading(false);
  };

  // Delete workflow
  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta automação?')) return;

    setLoading(true);
    try {
      await emailMarketingAPI.deleteWorkflow(workflowId);
      setWorkflows(workflows.filter(w => w.id !== workflowId));
      if (selectedWorkflow?.id === workflowId) {
        setSelectedWorkflow(null);
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
    }
    setLoading(false);
  };

  // Handle canvas drop
  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNodeType) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Determine node type based on dragged element
    const isTriggerId = triggerTypes.some(t => t.value === draggedNodeType);
    const nodeType = isTriggerId ? 'trigger' : 'action';

    addNode(draggedNodeType, nodeType, position);
    setDraggedNodeType(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ⚡ Automation Workflows
              </h2>
              <p className="text-gray-600">
                Crie automações inteligentes com gatilhos e ações personalizadas
              </p>
            </div>
            <button
              onClick={() => setShowBuilder(!showBuilder)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg font-semibold"
            >
              ➕ Nova Automação
            </button>
          </div>
        </div>
      </div>

      {/* Workflow Builder */}
      {showBuilder && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🛠️ Construtor de Automação
            </h3>
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Automação *
                </label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="ex: Boas-vindas para Novos Contatos"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Descreva esta automação..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Visual Builder */}
          <div className="flex h-96">
            {/* Element Palette */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-3">🎯 Gatilhos</h4>
                <div className="space-y-2">
                  {triggerTypes.map(trigger => (
                    <div
                      key={trigger.value}
                      draggable
                      onDragStart={() => setDraggedNodeType(trigger.value)}
                      className="p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-purple-400 hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{trigger.icon}</span>
                        <span className="font-medium text-sm">{trigger.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">{trigger.description}</p>
                    </div>
                  ))}
                </div>

                <h4 className="font-semibold text-gray-900 mb-3 mt-6">🔧 Ações</h4>
                <div className="space-y-2">
                  {actionTypes.map(action => (
                    <div
                      key={action.value}
                      draggable
                      onDragStart={() => setDraggedNodeType(action.value)}
                      className="p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{action.icon}</span>
                        <span className="font-medium text-sm">{action.label}</span>
                      </div>
                      <p className="text-xs text-gray-600">{action.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative bg-gray-100">
              <div
                className="w-full h-full"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleCanvasDrop}
              >
                {nodes.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-4">⚡</div>
                      <p className="text-lg mb-2">Arraste elementos para criar sua automação</p>
                      <p className="text-sm">Comece com um gatilho, depois adicione ações</p>
                    </div>
                  </div>
                ) : (
                  nodes.map((node) => (
                    <div
                      key={node.id}
                      className={`absolute p-4 rounded-lg shadow-lg border-2 cursor-move min-w-40 ${
                        node.type === 'trigger'
                          ? 'bg-purple-100 border-purple-400 text-purple-900'
                          : 'bg-blue-100 border-blue-400 text-blue-900'
                      }`}
                      style={{
                        left: node.position.x,
                        top: node.position.y
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {node.type === 'trigger'
                              ? triggerTypes.find(t => t.value === node.data.type)?.icon
                              : actionTypes.find(a => a.value === node.data.type)?.icon}
                          </span>
                          <span className="font-semibold text-sm">
                            {node.type === 'trigger'
                              ? triggerTypes.find(t => t.value === node.data.type)?.label
                              : actionTypes.find(a => a.value === node.data.type)?.label}
                          </span>
                        </div>
                        <button
                          onClick={() => removeNode(node.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                      
                      {/* Node configuration would go here */}
                      <div className="text-xs">
                        {node.type === 'trigger' ? '🎯 Gatilho' : '⚙️ Ação'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                onClick={createWorkflow}
                disabled={!workflowName.trim() || nodes.length === 0 || loading}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {loading ? '🔄 Criando...' : '✅ Criar Automação'}
              </button>
              <button
                onClick={() => {
                  setShowBuilder(false);
                  setWorkflowName('');
                  setWorkflowDescription('');
                  setNodes([]);
                  setConnections([]);
                }}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Workflows */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            🤖 Automações Ativas ({workflows.filter(w => w.isActive).length})
          </h3>
        </div>
        <div className="p-6">
          {loading && workflows.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-2xl mb-2">⏳</div>
              <p>Carregando automações...</p>
            </div>
          ) : workflows.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">⚡</div>
              <p className="text-lg mb-2">Nenhuma automação encontrada</p>
              <p className="text-sm">Crie sua primeira automação para aumentar o engajamento!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workflows.map((workflow) => (
                <div
                  key={workflow.id}
                  className={`p-6 border rounded-xl transition-all cursor-pointer ${
                    selectedWorkflow?.id === workflow.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                  onClick={() => {
                    setSelectedWorkflow(workflow);
                    onWorkflowSelect?.(workflow);
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold text-gray-900">{workflow.name}</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWorkflow(workflow.id, !workflow.isActive);
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          workflow.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {workflow.isActive ? '🟢 Ativa' : '⚪ Inativa'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteWorkflow(workflow.id);
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {workflow.description && (
                    <p className="text-sm text-gray-600 mb-4">{workflow.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600">🎯</span>
                      <span>Gatilho: {triggerTypes.find(t => t.value === workflow.trigger.type)?.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600">⚙️</span>
                      <span>{workflow.actions.length} ações configuradas</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm text-gray-500">
                    <span>Criado em {formatDateShort(workflow.createdAt)}</span>
                    <span>{workflow.totalRuns || 0} execuções</span>
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