'use client';

import React, { useState, useEffect } from 'react';

interface Campaign {
  id: string;
  name: string;
  type: string;
  sent: number;
  opens: number;
  clicks: number;
  date: string;
  status: string;
}

interface Stats {
  totalContacts: number;
  segmentStats: Record<string, number>;
  campaignsSent: number;
  avgOpenRate: string;
  avgClickRate: string;
}

export default function EmailMarketingPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testCampaignType, setTestCampaignType] = useState('promotional');
  const [campaigns] = useState<Campaign[]>([
    { id: '1', name: 'Promoção Miami', type: 'Promocional', sent: 1500, opens: 345, clicks: 52, date: '2024-01-15', status: 'Enviada' },
    { id: '2', name: 'Newsletter Semanal', type: 'Newsletter', sent: 5000, opens: 1150, clicks: 184, date: '2024-01-10', status: 'Enviada' },
    { id: '3', name: 'Reativação Q1', type: 'Reativação', sent: 800, opens: 96, clicks: 12, date: '2024-01-05', status: 'Enviada' }
  ]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/email-marketing?action=stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const sendCampaign = async (type: string) => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/email-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: `send_${type}`,
          segment: selectedSegment || undefined
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        fetchStats(); // Atualizar estatísticas
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Erro ao enviar campanha');
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) {
      setMessage('❌ Digite um email para teste');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/email-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send_test',
          email: testEmail,
          campaignType: testCampaignType
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(`✅ Email teste enviado para ${testEmail}!`);
        setShowTestModal(false);
        setTestEmail('');
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Erro ao enviar email teste');
    } finally {
      setLoading(false);
    }
  };

  const scheduleWeeklyCampaigns = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/email-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'schedule_weekly' })
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage('✅ Campanhas semanais agendadas!');
      }
    } catch (error) {
      setMessage('❌ Erro ao agendar campanhas');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setImportResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/email-import', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      setImportResult(result);
      
      if (result.success) {
        setMessage(`✅ ${result.imported} emails importados com sucesso!`);
        fetchStats(); // Atualizar estatísticas
      } else {
        setMessage(`❌ Erro na importação: ${result.error}`);
      }
    } catch (error) {
      setMessage('❌ Erro ao fazer upload do arquivo');
    } finally {
      setLoading(false);
    }
  };

  const downloadSampleCSV = async () => {
    try {
      const response = await fetch('/api/email-import?action=sample');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exemplo-emails.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setMessage('❌ Erro ao baixar exemplo');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString('pt-BR');
  const calculateRate = (part: number, total: number) => 
    total > 0 ? ((part / total) * 100).toFixed(1) + '%' : '0%';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-card">
        <div className="admin-card-content">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-admin-text-primary mb-1">
                📧 Email Marketing GRATUITO - Resend
              </h1>
              <p className="text-admin-text-secondary">
                Gerencie seus 5.000 emails sem custo usando N8N + Gmail API
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowImportModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-0 font-semibold flex items-center gap-2"
              >
                <span className="text-lg">📤</span>
                Importar 5k Emails
              </button>
              <div className="text-right">
                <div className="text-sm text-admin-text-secondary">Custo Total</div>
                <div className="text-2xl font-bold text-green-600">$0/mês</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="admin-stats-grid">
          <div className="admin-stats-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center text-2xl">
                📧
              </div>
            </div>
            <div className="admin-stats-value">{formatNumber(stats.totalContacts)}</div>
            <div className="admin-stats-label">Total de Contatos</div>
          </div>
          
          <div className="admin-stats-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white flex items-center justify-center text-2xl">
                📊
              </div>
            </div>
            <div className="admin-stats-value">{stats.campaignsSent}</div>
            <div className="admin-stats-label">Campanhas Enviadas</div>
          </div>
          
          <div className="admin-stats-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center justify-center text-2xl">
                👀
              </div>
            </div>
            <div className="admin-stats-value">{stats.avgOpenRate}</div>
            <div className="admin-stats-label">Taxa de Abertura</div>
          </div>
          
          <div className="admin-stats-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center text-2xl">
                🎯
              </div>
            </div>
            <div className="admin-stats-value">{stats.avgClickRate}</div>
            <div className="admin-stats-label">Taxa de Clique</div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">🚀 Ações Rápidas</h2>
          <p className="admin-card-description">Envie campanhas instantaneamente</p>
        </div>
        <div className="admin-card-content">
          {message && (
            <div className={`mb-4 p-3 rounded-lg ${
              message.includes('✅') 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="admin-label">Segmento (Opcional)</label>
              <select 
                className="admin-input"
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
              >
                <option value="">Todos os contatos</option>
                <option value="brasileiros-eua">Brasileiros nos EUA (1.500)</option>
                <option value="familias">Famílias (1.200)</option>
                <option value="casais">Casais/Lua de mel (1.000)</option>
                <option value="aventureiros">Aventureiros (800)</option>
                <option value="executivos">Executivos (500)</option>
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <button 
              onClick={() => setShowTestModal(true)}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl">🧪</span>
                <span className="font-semibold">Enviar Email Teste</span>
              </div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => sendCampaign('promotional')}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold">Campanha Promocional</div>
              <div className="text-sm opacity-90">Ofertas especiais Miami</div>
            </button>
            
            <button 
              onClick={() => sendCampaign('newsletter')}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-2">📰</div>
              <div className="font-semibold">Newsletter</div>
              <div className="text-sm opacity-90">Dicas + Ofertas da semana</div>
            </button>
            
            <button 
              onClick={() => sendCampaign('reactivation')}
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-2xl mb-2">💔</div>
              <div className="font-semibold">Reativação</div>
              <div className="text-sm opacity-90">Reconquistar clientes</div>
            </button>
          </div>
        </div>
      </div>

      {/* Automation */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">⚡ Automação</h2>
          <p className="admin-card-description">Configure envios automáticos</p>
        </div>
        <div className="admin-card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-lg mb-2">📅 Campanhas Semanais</h3>
              <p className="text-sm text-gray-600 mb-4">
                Agenda 4 campanhas automaticamente: Promocional → Newsletter → Promocional → Reativação
              </p>
              <button 
                onClick={scheduleWeeklyCampaigns}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                🕒 Agendar Automação
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
              <h3 className="font-semibold text-lg mb-2">🎯 ROI Esperado</h3>
              <div className="space-y-2 text-sm">
                <div>5.000 emails × 2% conversão = <strong>100 leads/mês</strong></div>
                <div>100 leads × 8% vendas = <strong>8 vendas/mês</strong></div>
                <div>8 sales × $2,500 = <strong>$20,000/month</strong></div>
                <div className="text-green-600 font-bold">ROI: ∞% (cost $0)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign History */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">📈 Histórico de Campanhas</h2>
        </div>
        <div className="admin-card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border-color">
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Campanha</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Tipo</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Enviados</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Aberturas</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Cliques</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Data</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-admin-border-color hover:bg-admin-bg-secondary/30">
                    <td className="py-3 px-2 font-medium text-admin-text-primary">{campaign.name}</td>
                    <td className="py-3 px-2 text-admin-text-secondary">{campaign.type}</td>
                    <td className="py-3 px-2 text-admin-text-primary">{formatNumber(campaign.sent)}</td>
                    <td className="py-3 px-2">
                      <div className="text-admin-text-primary">{formatNumber(campaign.opens)}</div>
                      <div className="text-xs text-admin-text-secondary">
                        {calculateRate(campaign.opens, campaign.sent)}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="text-admin-text-primary">{formatNumber(campaign.clicks)}</div>
                      <div className="text-xs text-admin-text-secondary">
                        {calculateRate(campaign.clicks, campaign.sent)}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-admin-text-secondary text-sm">
                      {new Date(campaign.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {campaign.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Setup Instructions */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">⚙️ Configuração Gratuita</h2>
        </div>
        <div className="admin-card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">🔧 Configuração N8N</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                <p className="mb-2">1. Instalar N8N (gratuito):</p>
                <code className="block bg-gray-800 text-green-400 p-2 rounded mb-2">
                  npx n8n
                </code>
                <p className="mb-2">2. Criar workflow Gmail API</p>
                <p>3. Configurar webhook para receber campanhas</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">📧 Alternativas Gratuitas</h3>
              <ul className="space-y-2 text-sm">
                <li>✅ <strong>Gmail API:</strong> 500 emails/dia por conta</li>
                <li>✅ <strong>Amazon SES:</strong> 62k emails/mês grátis</li>
                <li>✅ <strong>Mailchimp:</strong> 2k contatos grátis</li>
                <li>✅ <strong>Brevo:</strong> 300 emails/dia grátis</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-admin-bg-overlay z-50 flex items-center justify-center p-4">
          <div className="admin-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="admin-card-header">
              <div className="flex justify-between items-center">
                <h2 className="admin-card-title">📤 Importar Lista de Emails</h2>
                <button 
                  className="text-admin-text-secondary hover:text-admin-text-primary"
                  onClick={() => { setShowImportModal(false); setImportResult(null); }}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="admin-card-content">
              {!importResult ? (
                <>
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">📋 Formato do Arquivo CSV</h3>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm mb-4">
                      <p className="mb-2"><strong>Colunas obrigatórias:</strong> email, nome</p>
                      <p className="mb-2"><strong>Colunas opcionais:</strong> sobrenome, telefone, cidade, tags</p>
                      <p className="text-gray-600">Tags: separadas por ponto e vírgula (miami;voos;familia)</p>
                    </div>
                    
                    <button 
                      onClick={downloadSampleCSV}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      📥 Baixar Exemplo CSV
                    </button>
                  </div>

                  <div 
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="text-4xl mb-4">📁</div>
                    <p className="text-lg font-semibold mb-2">Arraste seu arquivo CSV aqui</p>
                    <p className="text-gray-600 mb-4">ou</p>
                    
                    <label className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer inline-block font-semibold">
                      📤 Selecionar Arquivo
                      <input 
                        type="file" 
                        accept=".csv" 
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    
                    <p className="text-sm text-gray-500 mt-4">
                      Máximo: 10MB • Formato: CSV • Até 50.000 contatos
                    </p>
                  </div>

                  {loading && (
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 text-blue-600">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Processando arquivo...
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  {importResult.success ? (
                    <div className="text-green-600">
                      <div className="text-6xl mb-4">✅</div>
                      <h3 className="text-xl font-bold mb-4">Importação Concluída!</h3>
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                          <div className="text-sm text-gray-600">Importados</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{importResult.duplicates}</div>
                          <div className="text-sm text-gray-600">Duplicatas</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{importResult.invalid}</div>
                          <div className="text-sm text-gray-600">Inválidos</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <div className="text-6xl mb-4">❌</div>
                      <h3 className="text-xl font-bold mb-4">Erro na Importação</h3>
                      <div className="bg-red-50 p-4 rounded-lg mb-4">
                        {importResult.errors?.map((error: string, index: number) => (
                          <p key={index} className="text-sm text-red-700">{error}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 justify-center">
                    {importResult.success && (
                      <button 
                        onClick={() => {
                          setShowImportModal(false);
                          setImportResult(null);
                          fetchStats();
                        }}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        🚀 Enviar Campanha Agora
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setShowImportModal(false);
                        setImportResult(null);
                      }}
                      className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Fechar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Teste */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">🧪 Enviar Email Teste</h2>
            
            <div className="mb-4">
              <label className="admin-label">Email para Teste</label>
              <input
                type="email"
                className="admin-input"
                placeholder="seu@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="admin-label">Tipo de Campanha</label>
              <select 
                className="admin-input"
                value={testCampaignType}
                onChange={(e) => setTestCampaignType(e.target.value)}
              >
                <option value="promotional">🎯 Promocional</option>
                <option value="newsletter">📰 Newsletter</option>
                <option value="reactivation">💔 Reativação</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={sendTestEmail}
                disabled={loading || !testEmail}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Enviando...' : 'Enviar Teste'}
              </button>
              <button
                onClick={() => {
                  setShowTestModal(false);
                  setTestEmail('');
                }}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
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