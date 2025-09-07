'use client';

import React, { useState, useEffect } from 'react';
import { ABTest, ABTestVariant, Campaign } from '@/lib/email-marketing/utils';
import { emailMarketingAPI } from '@/lib/email-marketing/api';

interface ABTestingFrameworkProps {
  campaigns?: Campaign[];
  className?: string;
}

export default function ABTestingFramework({ campaigns = [], className = "" }: ABTestingFrameworkProps) {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    campaignId: '',
    variants: [{ name: 'Versão A', subject: '', content: '' }, { name: 'Versão B', subject: '', content: '' }],
    trafficSplit: [50, 50],
    winnerCriteria: 'open_rate' as const,
    confidenceLevel: 95
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    setLoading(true);
    try {
      const response = await emailMarketingAPI.getABTests();
      if (response.success && response.data) {
        setTests(response.data);
      }
    } catch (error) {
      console.error('Error loading A/B tests:', error);
    }
    setLoading(false);
  };

  const createTest = async () => {
    if (!newTest.name.trim() || !newTest.campaignId) return;
    
    setLoading(true);
    try {
      const response = await emailMarketingAPI.createABTest({
        name: newTest.name,
        campaignId: newTest.campaignId,
        variants: newTest.variants,
        trafficSplit: newTest.trafficSplit,
        winnerCriteria: newTest.winnerCriteria,
        confidenceLevel: newTest.confidenceLevel
      });
      
      if (response.success && response.data) {
        setTests([...tests, response.data]);
        setShowCreateModal(false);
        setNewTest({
          name: '',
          campaignId: '',
          variants: [{ name: 'Versão A', subject: '', content: '' }, { name: 'Versão B', subject: '', content: '' }],
          trafficSplit: [50, 50],
          winnerCriteria: 'open_rate',
          confidenceLevel: 95
        });
      }
    } catch (error) {
      console.error('Error creating A/B test:', error);
    }
    setLoading(false);
  };

  const startTest = async (testId: string) => {
    setLoading(true);
    try {
      await emailMarketingAPI.startABTest(testId);
      await loadTests();
    } catch (error) {
      console.error('Error starting test:', error);
    }
    setLoading(false);
  };

  const stopTest = async (testId: string) => {
    setLoading(true);
    try {
      await emailMarketingAPI.stopABTest(testId);
      await loadTests();
    } catch (error) {
      console.error('Error stopping test:', error);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      running: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      paused: 'bg-yellow-100 text-yellow-700'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const addVariant = () => {
    if (newTest.variants.length < 5) {
      const nextLetter = String.fromCharCode(65 + newTest.variants.length);
      setNewTest(prev => ({
        ...prev,
        variants: [...prev.variants, { name: `Versão ${nextLetter}`, subject: '', content: '' }],
        trafficSplit: [...prev.trafficSplit, 0]
      }));
    }
  };

  const removeVariant = (index: number) => {
    if (newTest.variants.length > 2) {
      setNewTest(prev => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index),
        trafficSplit: prev.trafficSplit.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🧪 A/B Testing Framework
              </h2>
              <p className="text-gray-600">
                Teste diferentes versões e otimize suas campanhas com dados
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg font-semibold"
            >
              ➕ Novo Teste A/B
            </button>
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tests.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🧪</div>
            <p className="text-lg mb-2">Nenhum teste A/B encontrado</p>
            <p className="text-sm">Crie seu primeiro teste para otimizar suas campanhas</p>
          </div>
        ) : (
          tests.map(test => (
            <div key={test.id} className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{test.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(test.status)}`}>
                    {test.status === 'running' ? '🔄 Rodando' : 
                     test.status === 'completed' ? '✅ Concluído' :
                     test.status === 'paused' ? '⏸️ Pausado' : '📝 Rascunho'}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Critério:</span>
                      <span className="ml-2 font-medium">
                        {test.winnerCriteria === 'open_rate' ? 'Taxa de Abertura' :
                         test.winnerCriteria === 'click_rate' ? 'Taxa de Clique' :
                         test.winnerCriteria === 'conversion_rate' ? 'Taxa de Conversão' : 'Receita'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Confiança:</span>
                      <span className="ml-2 font-medium">{test.confidenceLevel}%</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Variantes:</h4>
                    <div className="space-y-2">
                      {test.variants.map((variant, index) => {
                        const openRate = variant.sent > 0 ? (variant.opens / variant.sent * 100).toFixed(1) : '0.0';
                        const clickRate = variant.sent > 0 ? (variant.clicks / variant.sent * 100).toFixed(1) : '0.0';
                        
                        return (
                          <div key={variant.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="font-medium">{variant.name}</div>
                              <div className="text-sm text-gray-600">
                                {variant.sent} enviados • {openRate}% abertura • {clickRate}% cliques
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">{test.trafficSplit[index]}%</div>
                              <div className="text-xs text-gray-500">tráfego</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {test.results && test.winner && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="font-semibold text-green-800 mb-1">🏆 Vencedor Identificado!</div>
                      <div className="text-sm text-green-700">
                        {test.variants.find(v => v.id === test.winner)?.name} com {test.results.improvement.toFixed(1)}% de melhoria
                        (Confiança: {test.results.confidence.toFixed(1)}%)
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {test.status === 'draft' && (
                      <button
                        onClick={() => startTest(test.id)}
                        disabled={loading}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        ▶️ Iniciar Teste
                      </button>
                    )}
                    {test.status === 'running' && (
                      <button
                        onClick={() => stopTest(test.id)}
                        disabled={loading}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        ⏹️ Parar Teste
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Criar Novo Teste A/B</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Teste</label>
                  <input
                    type="text"
                    value={newTest.name}
                    onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: Teste de Subject Line"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campanha Base</label>
                  <select
                    value={newTest.campaignId}
                    onChange={(e) => setNewTest(prev => ({ ...prev, campaignId: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione uma campanha</option>
                    {campaigns.map(campaign => (
                      <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Critério de Vitória</label>
                  <select
                    value={newTest.winnerCriteria}
                    onChange={(e) => setNewTest(prev => ({ ...prev, winnerCriteria: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="open_rate">Taxa de Abertura</option>
                    <option value="click_rate">Taxa de Clique</option>
                    <option value="conversion_rate">Taxa de Conversão</option>
                    <option value="revenue">Receita</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Confiança (%)</label>
                  <input
                    type="number"
                    min="90"
                    max="99"
                    value={newTest.confidenceLevel}
                    onChange={(e) => setNewTest(prev => ({ ...prev, confidenceLevel: Number(e.target.value) }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-gray-900">Variantes do Teste</h4>
                  <button
                    onClick={addVariant}
                    disabled={newTest.variants.length >= 5}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
                  >
                    ➕ Adicionar Variante
                  </button>
                </div>
                
                <div className="space-y-4">
                  {newTest.variants.map((variant, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => {
                            const newVariants = [...newTest.variants];
                            newVariants[index].name = e.target.value;
                            setNewTest(prev => ({ ...prev, variants: newVariants }));
                          }}
                          className="font-medium bg-transparent border-b border-gray-200 focus:border-blue-500 outline-none"
                        />
                        {newTest.variants.length > 2 && (
                          <button
                            onClick={() => removeVariant(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Assunto</label>
                          <input
                            type="text"
                            value={variant.subject}
                            onChange={(e) => {
                              const newVariants = [...newTest.variants];
                              newVariants[index].subject = e.target.value;
                              setNewTest(prev => ({ ...prev, variants: newVariants }));
                            }}
                            className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-1">% do Tráfego</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={newTest.trafficSplit[index]}
                              onChange={(e) => {
                                const newSplit = [...newTest.trafficSplit];
                                newSplit[index] = Number(e.target.value);
                                setNewTest(prev => ({ ...prev, trafficSplit: newSplit }));
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={createTest}
                disabled={!newTest.name.trim() || !newTest.campaignId || loading}
                className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Criando...' : 'Criar Teste A/B'}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}