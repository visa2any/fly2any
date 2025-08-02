'use client';

import React, { useState } from 'react';

interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

interface DiagnosticResponse {
  success: boolean;
  timestamp: string;
  diagnostics: DiagnosticResult[];
  summary: {
    status: string;
    message: string;
    total_tests: number;
    successes: number;
    warnings: number;
    errors: number;
  };
}

export default function TestGmailPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DiagnosticResponse | null>(null);
  const [testEmail, setTestEmail] = useState('');

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-gmail');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Erro ao executar diagnósticos:', error);
    } finally {
      setLoading(false);
    }
  };

  const testSpecificEmail = async () => {
    if (!testEmail) {
      alert('Digite um email para teste');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/email-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send_test',
          email: testEmail,
          campaignType: 'promotional'
        })
      });
      
      const data = await response.json();
      alert(data.success ? `✅ ${data.message}` : `❌ ${data.error}`);
    } catch (error) {
      alert('❌ Erro ao enviar email teste');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="bg-white rounded-xl shadow-lg border border-gray-200-title">🧪 Diagnóstico Gmail SMTP</h1>
              <p className="bg-white rounded-xl shadow-lg border border-gray-200-description">
                Teste completo do sistema de email marketing
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={runDiagnostics}
                disabled={loading}
                className="admin-btn admin-btn-sm admin-btn-primary"
              >
                {loading ? '🔄 Testando...' : '🧪 Executar Diagnóstico'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Teste de Email Específico */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
          <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title" style={{ marginBottom: '12px' }}>
            📧 Teste de Email Específico
          </h3>
          <div className="flex gap-3">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Digite um email para teste..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1"
            />
            <button 
              onClick={testSpecificEmail}
              disabled={loading || !testEmail}
              className="admin-btn admin-btn-sm admin-btn-secondary"
            >
              📤 Enviar Teste
            </button>
          </div>
        </div>
      </div>

      {/* Resultados dos Diagnósticos */}
      {results && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200-header">
            <h2 className="bg-white rounded-xl shadow-lg border border-gray-200-title">
              📊 Resultados do Diagnóstico
            </h2>
            <p className="bg-white rounded-xl shadow-lg border border-gray-200-description">
              Executado em: {new Date(results.timestamp).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
            {/* Summary */}
            <div className={`p-4 rounded-lg border mb-6 ${getStatusColor(results.summary.status)}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getStatusIcon(results.summary.status)}</span>
                <div>
                  <h3 className="font-bold text-lg">{results.summary.message}</h3>
                  <p className="text-sm">
                    {results.summary.successes} sucessos, {results.summary.warnings} avisos, {results.summary.errors} erros
                  </p>
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              {results.diagnostics.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getStatusIcon(result.status)}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold">{result.step}</h4>
                      <p className="text-sm mt-1">{result.message}</p>
                      
                      {result.details && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-sm font-medium">
                            📋 Ver Detalhes
                          </summary>
                          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200-content">
          <h3 className="bg-white rounded-xl shadow-lg border border-gray-200-title" style={{ marginBottom: '12px' }}>
            📖 Como Interpretar os Resultados
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span><strong>Sucesso:</strong> Teste passou, tudo funcionando</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <span><strong>Aviso:</strong> Funciona mas pode ter problemas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-600">❌</span>
              <span><strong>Erro:</strong> Teste falhou, requer correção</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}