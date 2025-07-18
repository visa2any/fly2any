'use client';

import React, { useState } from 'react';

interface EmailProvider {
  name: string;
  free: string;
  pricing: string;
  features: string[];
  setup: string;
  pros: string[];
  cons: string[];
  apiEndpoint?: string;
}

const emailProviders: EmailProvider[] = [
  {
    name: 'Amazon SES',
    free: '62.000 emails/mês',
    pricing: '$0.10 por 1.000 emails',
    features: ['Alta deliverability', 'Sem limite de contatos', 'APIs robustas'],
    setup: 'Complexo (AWS Console)',
    pros: ['Mais barato', 'Escalável', '99%+ deliverability'],
    cons: ['Setup complexo', 'Requer AWS knowledge'],
    apiEndpoint: '/api/email-ses'
  },
  {
    name: 'Resend (Atual)',
    free: '3.000 emails/mês',
    pricing: '$20/mês para 50k emails',
    features: ['Fácil integração', 'Dashboard bonito', 'Templates'],
    setup: 'Simples',
    pros: ['Interface amigável', 'Setup rápido', 'Boa documentação'],
    cons: ['Mais caro', 'Limites baixos no free']
  },
  {
    name: 'Sender.net',
    free: '15.000 emails/mês',
    pricing: 'Grátis para sempre',
    features: ['15k emails grátis', 'Templates', 'Analytics'],
    setup: 'Simples',
    pros: ['Mais generoso grátis', 'Fácil de usar'],
    cons: ['Menos recursos avançados']
  },
  {
    name: 'Nodemailer + Gmail',
    free: '500 emails/dia (15k/mês)',
    pricing: 'Grátis',
    features: ['Simples', 'Confiável', 'Sem custos'],
    setup: 'Médio (App passwords)',
    pros: ['100% grátis', 'Boa deliverability'],
    cons: ['Limite baixo', 'Pode ser bloqueado']
  },
  {
    name: 'Brevo (ex-Sendinblue)',
    free: '300 emails/dia (9k/mês)',
    pricing: '$25/mês para 20k emails',
    features: ['SMS incluído', 'Marketing automation', 'Landing pages'],
    setup: 'Simples',
    pros: ['Recursos completos', 'SMS incluído'],
    cons: ['Mais caro que alternativas']
  }
];

export default function EmailProvidersPage() {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testProvider = async (providerName: string, apiEndpoint?: string) => {
    if (!testEmail || !apiEndpoint) {
      alert('Digite um email e selecione um provedor com API configurada');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'send_test',
          email: testEmail,
          campaignType: 'promotional'
        })
      });
      
      const data = await response.json();
      setTestResult({ provider: providerName, ...data });
    } catch (error) {
      setTestResult({ 
        provider: providerName, 
        success: false, 
        error: 'Erro de conexão' 
      });
    } finally {
      setTesting(false);
    }
  };

  const calculateMonthlyCost = (provider: EmailProvider, emails: number) => {
    switch (provider.name) {
      case 'Amazon SES':
        if (emails <= 62000) return '$0';
        return `$${((emails - 62000) * 0.0001).toFixed(2)}`;
      case 'Resend (Atual)':
        if (emails <= 3000) return '$0';
        if (emails <= 50000) return '$20';
        return `$${(20 + ((emails - 50000) * 0.001)).toFixed(2)}`;
      case 'Sender.net':
        if (emails <= 15000) return '$0';
        return 'Consultar pricing';
      case 'Nodemailer + Gmail':
        if (emails <= 15000) return '$0';
        return 'Excede limite';
      case 'Brevo (ex-Sendinblue)':
        if (emails <= 9000) return '$0';
        if (emails <= 20000) return '$25';
        return `$${(25 + ((emails - 20000) * 0.002)).toFixed(2)}`;
      default:
        return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-card">
        <div className="admin-card-content">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-admin-text-primary mb-1">
                📧 Comparação de Provedores de Email
              </h1>
              <p className="text-admin-text-secondary">
                Escolha o melhor provedor para email marketing em massa
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-admin-text-secondary">Economia Potencial</div>
              <div className="text-2xl font-bold text-green-600">-95%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Teste Rápido */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">🧪 Teste Rápido de Provedor</h2>
        </div>
        <div className="admin-card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="email"
              placeholder="Seu email para teste"
              className="admin-input"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
            <select 
              className="admin-input"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
            >
              <option value="">Selecione provedor</option>
              {emailProviders.filter(p => p.apiEndpoint).map(provider => (
                <option key={provider.name} value={provider.name}>
                  {provider.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const provider = emailProviders.find(p => p.name === selectedProvider);
                if (provider) testProvider(provider.name, provider.apiEndpoint);
              }}
              disabled={testing || !testEmail || !selectedProvider}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {testing ? 'Testando...' : 'Testar Envio'}
            </button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult.success 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              <strong>{testResult.provider}:</strong> {
                testResult.success 
                  ? `✅ ${testResult.message}` 
                  : `❌ ${testResult.error}`
              }
            </div>
          )}
        </div>
      </div>

      {/* Comparação de Custos */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">💰 Simulador de Custos</h2>
        </div>
        <div className="admin-card-content">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border-color">
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Provedor</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">5k emails</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">50k emails</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">100k emails</th>
                  <th className="text-left py-3 px-2 text-admin-text-secondary font-medium">Recomendação</th>
                </tr>
              </thead>
              <tbody>
                {emailProviders.map((provider) => (
                  <tr key={provider.name} className="border-b border-admin-border-color hover:bg-admin-bg-secondary/30">
                    <td className="py-3 px-2 font-medium text-admin-text-primary">
                      {provider.name}
                      {provider.name.includes('SES') && ' 🔥'}
                      {provider.name.includes('Sender') && ' 🏆'}
                    </td>
                    <td className="py-3 px-2 text-admin-text-primary">{calculateMonthlyCost(provider, 5000)}</td>
                    <td className="py-3 px-2 text-admin-text-primary">{calculateMonthlyCost(provider, 50000)}</td>
                    <td className="py-3 px-2 text-admin-text-primary">{calculateMonthlyCost(provider, 100000)}</td>
                    <td className="py-3 px-2">
                      {provider.name.includes('SES') && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">🏆 Mais Barato</span>}
                      {provider.name.includes('Sender') && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">🎯 Melhor Free</span>}
                      {provider.name.includes('Resend') && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">⚠️ Atual</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Comparação Detalhada */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {emailProviders.map((provider) => (
          <div key={provider.name} className="admin-card h-full">
            <div className="admin-card-header">
              <h3 className="admin-card-title flex items-center gap-2">
                {provider.name}
                {provider.name.includes('SES') && '🔥'}
                {provider.name.includes('Sender') && '🏆'}
                {provider.name.includes('Atual') && '⚠️'}
              </h3>
            </div>
            <div className="admin-card-content flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                <div>
                  <div className="text-sm text-admin-text-secondary">Plano Grátis</div>
                  <div className="font-semibold text-admin-text-primary">{provider.free}</div>
                </div>
                
                <div>
                  <div className="text-sm text-admin-text-secondary">Pricing</div>
                  <div className="font-semibold text-admin-text-primary">{provider.pricing}</div>
                </div>

                <div>
                  <div className="text-sm text-admin-text-secondary mb-2">Recursos</div>
                  <ul className="space-y-1">
                    {provider.features.map((feature, index) => (
                      <li key={index} className="text-sm text-admin-text-primary flex items-center gap-1">
                        <span className="text-green-500">✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-sm text-admin-text-secondary mb-2">Prós</div>
                  <ul className="space-y-1">
                    {provider.pros.map((pro, index) => (
                      <li key={index} className="text-sm text-green-600 flex items-center gap-1">
                        <span>👍</span> {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-sm text-admin-text-secondary mb-2">Contras</div>
                  <ul className="space-y-1">
                    {provider.cons.map((con, index) => (
                      <li key={index} className="text-sm text-red-600 flex items-center gap-1">
                        <span>👎</span> {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-admin-border-color">
                <div className="text-sm text-admin-text-secondary">Setup</div>
                <div className="font-semibold text-admin-text-primary">{provider.setup}</div>
                
                {provider.apiEndpoint && (
                  <button
                    onClick={() => testProvider(provider.name, provider.apiEndpoint)}
                    className="mt-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Testar Agora
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recomendação Final */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">🎯 Recomendação Final</h2>
        </div>
        <div className="admin-card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 p-6 rounded-xl border border-green-200">
              <h3 className="font-semibold text-lg mb-2 text-green-800">🔥 Para Economia Máxima</h3>
              <p className="text-green-700 mb-4"><strong>Amazon SES</strong></p>
              <ul className="space-y-2 text-sm text-green-600">
                <li>✅ 62.000 emails grátis/mês</li>
                <li>✅ $0.10 por 1.000 emails depois</li>
                <li>✅ Economia de 95% vs outros</li>
                <li>⚠️ Setup mais complexo</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-lg mb-2 text-blue-800">🏆 Para Facilidade</h3>
              <p className="text-blue-700 mb-4"><strong>Sender.net</strong></p>
              <ul className="space-y-2 text-sm text-blue-600">
                <li>✅ 15.000 emails grátis/mês</li>
                <li>✅ Setup super simples</li>
                <li>✅ Interface amigável</li>
                <li>✅ Sem custos ocultos</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <h3 className="font-semibold text-lg mb-2 text-yellow-800">⚡ Para Teste Imediato</h3>
              <p className="text-yellow-700 mb-4"><strong>Resend (Corrigido)</strong></p>
              <ul className="space-y-2 text-sm text-yellow-600">
                <li>✅ Já configurado</li>
                <li>✅ Funcionando agora</li>
                <li>✅ 3.000 emails grátis/mês</li>
                <li>⚠️ Mais caro no longo prazo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}