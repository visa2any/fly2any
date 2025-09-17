'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { emailMarketingAPI } from '../../lib/email-marketing/api';

interface DeliverabilityToolsProps {
  className?: string;
}

interface DeliverabilityIssue {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  fix: string;
}

export default function DeliverabilityTools({ className = "" }: DeliverabilityToolsProps) {
  const [deliverabilityScore, setDeliverabilityScore] = useState<number>(0);
  const [issues, setIssues] = useState<DeliverabilityIssue[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [domainToCheck, setDomainToCheck] = useState('');
  const [domainResult, setDomainResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkDeliverability();
  }, []);

  const checkDeliverability = async () => {
    setLoading(true);
    try {
      const response = await emailMarketingAPI.checkDeliverability();
      if (response.success && response.data) {
        setDeliverabilityScore(response.data.score);
        setIssues((response.data.issues as DeliverabilityIssue[]) || []);
        setRecommendations(response.data.recommendations || []);
      } else {
        // Mock data for demo
        setDeliverabilityScore(87);
        setIssues([
          {
            type: 'SPF Record',
            severity: 'medium' as const,
            message: 'SPF record pode ser otimizado',
            fix: 'Adicione "include:mailgun.org" ao seu registro SPF'
          },
          {
            type: 'Domain Reputation',
            severity: 'low' as const,
            message: 'Reputação do domínio está boa, mas pode melhorar',
            fix: 'Continue enviando emails de qualidade para contatos engajados'
          }
        ]);
        setRecommendations([
          'Configure DMARC para melhorar a autenticação',
          'Use um domínio dedicado para email marketing',
          'Mantenha uma lista limpa removendo bounces',
          'Monitore regularmente sua reputação de IP',
          'Implemente double opt-in para novos contatos'
        ]);
      }
    } catch (error) {
      console.error('Error checking deliverability:', error);
    }
    setLoading(false);
  };

  const checkDomainReputation = async () => {
    if (!domainToCheck.trim()) return;
    
    setLoading(true);
    try {
      const response = await emailMarketingAPI.getDomainReputation(domainToCheck);
      if (response.success && response.data) {
        setDomainResult(response.data);
      } else {
        // Mock data for demo
        setDomainResult({
          reputation: Math.floor(Math.random() * 30) + 70,
          blacklisted: Math.random() < 0.1,
          issues: Math.random() < 0.3 ? ['Listado em algumas blacklists menores'] : [],
          recommendations: [
            'Monitore regularmente a reputação',
            'Use ferramentas de verificação de blacklist',
            'Mantenha práticas de email marketing limpas'
          ]
        });
      }
    } catch (error) {
      console.error('Error checking domain reputation:', error);
    }
    setLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      medium: 'bg-orange-50 border-orange-200 text-orange-800',
      high: 'bg-red-50 border-red-200 text-red-800',
      critical: 'bg-red-100 border-red-300 text-red-900'
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getSeverityIcon = (severity: string) => {
    const icons = {
      low: '⚠️',
      medium: '🔶',
      high: '🔴',
      critical: '🚨'
    };
    return icons[severity as keyof typeof icons] || '⚠️';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🛡️ Ferramentas de Deliverabilidade
              </h2>
              <p className="text-gray-600">
                Monitore e otimize a entregabilidade dos seus emails
              </p>
            </div>
            <button
              onClick={checkDeliverability}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg font-semibold disabled:opacity-50"
            >
              {loading ? '🔄 Verificando...' : '🔄 Verificar Agora'}
            </button>
          </div>
        </div>
      </div>

      {/* Deliverability Score */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Score de Deliverabilidade</h3>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 54}`}
                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - deliverabilityScore / 100)}`}
                  className={getScoreColor(deliverabilityScore)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(deliverabilityScore)}`}>
                  {deliverabilityScore}
                </span>
                <span className="text-sm text-gray-600">/ 100</span>
                <span className={`text-lg font-bold ${getScoreColor(deliverabilityScore)}`}>
                  {getScoreGrade(deliverabilityScore)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              {deliverabilityScore >= 90 ? 'Excelente!' : 
               deliverabilityScore >= 80 ? 'Bom!' :
               deliverabilityScore >= 70 ? 'Regular' : 'Precisa melhorar'}
            </p>
            <p className="text-gray-600">
              Sua entregabilidade está{' '}
              {deliverabilityScore >= 90 ? 'ótima' : 
               deliverabilityScore >= 80 ? 'boa' :
               deliverabilityScore >= 70 ? 'na média' : 'abaixo da média'}
            </p>
          </div>
        </div>
      </div>

      {/* Issues and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              🚨 Problemas Identificados ({issues.length})
            </h3>
            
            {issues.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">✅</div>
                <p>Nenhum problema crítico encontrado</p>
                <p className="text-sm">Sua configuração está adequada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {issues.map((issue, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getSeverityIcon(issue.severity)}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{issue.type}</h4>
                        <p className="text-sm mb-2">{issue.message}</p>
                        <div className="text-xs font-medium">
                          <span className="uppercase tracking-wide">Solução:</span>
                          <p className="mt-1">{issue.fix}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              💡 Recomendações ({recommendations.length})
            </h3>
            
            <div className="space-y-3">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-500 text-lg">💡</span>
                  <div className="flex-1">
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Domain Reputation Checker */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🔍 Verificador de Reputação de Domínio
          </h3>
          
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={domainToCheck}
              onChange={(e) => setDomainToCheck(e.target.value)}
              placeholder="ex: exemplo.com"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={checkDomainReputation}
              disabled={!domainToCheck.trim() || loading}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
          </div>

          {domainResult && (
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${getScoreColor(domainResult.reputation)}`}>
                    {domainResult.reputation}/100
                  </div>
                  <div className="text-sm text-gray-600">Score de Reputação</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${domainResult.blacklisted ? 'text-red-600' : 'text-green-600'}`}>
                    {domainResult.blacklisted ? '❌' : '✅'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {domainResult.blacklisted ? 'Em Blacklist' : 'Não Listado'}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2 text-blue-600">
                    {domainResult.issues?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Problemas Encontrados</div>
                </div>
              </div>

              {domainResult.issues && domainResult.issues.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Problemas:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {domainResult.issues.map((issue: string, index: number) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {domainResult.recommendations && domainResult.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Recomendações:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                    {domainResult.recommendations.map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Email Authentication Status */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            🔐 Status de Autenticação de Email
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-semibold text-green-800 mb-1">SPF</div>
              <div className="text-sm text-green-600">Configurado</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-semibold text-green-800 mb-1">DKIM</div>
              <div className="text-sm text-green-600">Ativo</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl mb-2">⚠️</div>
              <div className="font-semibold text-yellow-800 mb-1">DMARC</div>
              <div className="text-sm text-yellow-600">Não configurado</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-blue-500 text-lg">💡</span>
              <div>
                <h4 className="font-semibold text-blue-800 mb-1">Dica Pro:</h4>
                <p className="text-sm text-blue-700">
                  Configure DMARC para completar sua autenticação de email e melhorar ainda mais 
                  sua deliverabilidade. Isso ajuda a proteger contra spam e phishing usando seu domínio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}