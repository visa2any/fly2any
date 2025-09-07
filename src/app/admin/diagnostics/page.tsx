'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function AdminDiagnosticsPage() {
  const { data: session, status } = useSession();
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runDiagnostics = async () => {
      try {
        const results: any = {
          timestamp: new Date().toISOString(),
          session: {
            status: status,
            user: session?.user || null,
            exists: !!session,
          },
          cookies: {
            all: document.cookie,
            sessionTokens: document.cookie.split(';').filter(cookie => 
              cookie.includes('next-auth')
            ),
          },
          environment: {
            nodeEnv: process.env.NODE_ENV,
            url: window.location.href,
            origin: window.location.origin,
          }
        };

        // Test session endpoint
        try {
          const sessionResponse = await fetch('/api/auth/session');
          results.sessionApi = {
            status: sessionResponse.status,
            ok: sessionResponse.ok,
            data: sessionResponse.ok ? await sessionResponse.json() : null,
          };
        } catch (error) {
          results.sessionApi = { error: error instanceof Error ? error.message : 'Unknown error' };
        }

        // Test admin API
        try {
          const adminResponse = await fetch('/api/admin/system/health');
          results.adminApi = {
            status: adminResponse.status,
            ok: adminResponse.ok,
            accessible: adminResponse.status !== 404,
          };
        } catch (error) {
          results.adminApi = { error: error instanceof Error ? error.message : 'Unknown error' };
        }

        setDiagnostics(results);
      } catch (error) {
        console.error('Diagnostics error:', error);
        setDiagnostics({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        setLoading(false);
      }
    };

    if (status !== 'loading') {
      runDiagnostics();
    }
  }, [session, status]);

  const getStatusIcon = (condition: boolean) => condition ? '✅' : '❌';
  const getStatusColor = (condition: boolean) => condition ? 'text-green-600' : 'text-red-600';

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-4">Executando diagnósticos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Diagnósticos do Sistema</h1>
        <p className="text-gray-600">Relatório detalhado do status de autenticação e sistema</p>
        <p className="text-sm text-gray-500 mt-2">
          Gerado em: {diagnostics.timestamp}
        </p>
      </div>

      {/* Session Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🔐</span>
          Status da Sessão
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Status da sessão:</span>
              <span className={`font-semibold ${
                diagnostics.session?.status === 'authenticated' ? 'text-green-600' : 'text-red-600'
              }`}>
                {getStatusIcon(diagnostics.session?.status === 'authenticated')} {diagnostics.session?.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Usuário autenticado:</span>
              <span className={getStatusColor(!!diagnostics.session?.user)}>
                {getStatusIcon(!!diagnostics.session?.user)} {diagnostics.session?.user ? 'Sim' : 'Não'}
              </span>
            </div>

            {diagnostics.session?.user && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Dados do usuário:</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Nome:</strong> {diagnostics.session.user.name || 'N/A'}</div>
                  <div><strong>Email:</strong> {diagnostics.session.user.email || 'N/A'}</div>
                  <div><strong>ID:</strong> {diagnostics.session.user.id || 'N/A'}</div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Cookies de sessão:</span>
              <span className={getStatusColor(diagnostics.cookies?.sessionTokens?.length > 0)}>
                {getStatusIcon(diagnostics.cookies?.sessionTokens?.length > 0)} 
                {diagnostics.cookies?.sessionTokens?.length || 0} encontrados
              </span>
            </div>

            {diagnostics.cookies?.sessionTokens?.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium mb-2">Cookies NextAuth:</h4>
                <div className="text-xs space-y-1 max-h-20 overflow-y-auto">
                  {diagnostics.cookies.sessionTokens.map((cookie: string, index: number) => (
                    <div key={index} className="break-all">
                      {cookie.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* API Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🔌</span>
          Status das APIs
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-medium">API de Sessão</h3>
            <div className="flex items-center justify-between">
              <span>Endpoint acessível:</span>
              <span className={getStatusColor(diagnostics.sessionApi?.ok)}>
                {getStatusIcon(diagnostics.sessionApi?.ok)} {diagnostics.sessionApi?.status || 'N/A'}
              </span>
            </div>
            
            {diagnostics.sessionApi?.data && (
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <pre className="whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {JSON.stringify(diagnostics.sessionApi.data, null, 2)}
                </pre>
              </div>
            )}

            {diagnostics.sessionApi?.error && (
              <div className="bg-red-50 p-3 rounded-lg text-sm text-red-700">
                <strong>Erro:</strong> {diagnostics.sessionApi.error}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">API Admin</h3>
            <div className="flex items-center justify-between">
              <span>Endpoint acessível:</span>
              <span className={getStatusColor(diagnostics.adminApi?.accessible)}>
                {getStatusIcon(diagnostics.adminApi?.accessible)} 
                {diagnostics.adminApi?.status || 'N/A'}
              </span>
            </div>

            {diagnostics.adminApi?.error && (
              <div className="bg-red-50 p-3 rounded-lg text-sm text-red-700">
                <strong>Erro:</strong> {diagnostics.adminApi.error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Environment Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🌍</span>
          Informações do Ambiente
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Node Environment:</strong><br />
            <code className="bg-gray-100 px-2 py-1 rounded">
              {diagnostics.environment?.nodeEnv || 'N/A'}
            </code>
          </div>
          
          <div>
            <strong>URL Atual:</strong><br />
            <code className="bg-gray-100 px-2 py-1 rounded text-xs break-all">
              {diagnostics.environment?.url || 'N/A'}
            </code>
          </div>
          
          <div>
            <strong>Origin:</strong><br />
            <code className="bg-gray-100 px-2 py-1 rounded">
              {diagnostics.environment?.origin || 'N/A'}
            </code>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-3">Recomendações</h2>
        <div className="space-y-2 text-blue-700">
          {diagnostics.session?.status !== 'authenticated' && (
            <div>• Execute o login através da página /admin/login</div>
          )}
          {!diagnostics.sessionApi?.ok && (
            <div>• Verifique se as rotas de API NextAuth estão configuradas corretamente</div>
          )}
          {diagnostics.cookies?.sessionTokens?.length === 0 && (
            <div>• Limpe os cookies do navegador e tente fazer login novamente</div>
          )}
          {diagnostics.session?.status === 'authenticated' && diagnostics.sessionApi?.ok && (
            <div className="text-green-700">✅ Sistema funcionando corretamente!</div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Atualizar Diagnósticos
        </button>
        
        <button
          onClick={() => window.location.href = '/admin/login'}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          🔑 Ir para Login
        </button>
        
        <button
          onClick={() => window.location.href = '/admin'}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          🏠 Dashboard
        </button>
      </div>
    </div>
  );
}