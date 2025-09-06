'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not-found'>('loading');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Pegar email da URL
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
      setStatus('loading');
    } else {
      setStatus('error');
    }
  }, []);

  const handleUnsubscribe = async (): Promise<void> => {
    if (!email) return;
    
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
      } else if (response.status === 404) {
        setStatus('not-found');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Erro ao descadastrar:', error);
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card className="bg-white shadow-2xl border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-8 text-center">
            {/* Header */}
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-3xl text-white">✈️</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Fly2Any</h1>
              <p className="text-slate-600">Gerenciar Preferências de Email</p>
            </div>

            {/* Loading State */}
            {status === 'loading' && (
              <div className="space-y-6">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-800 mb-2">
                    Verificando seu email...
                  </h2>
                  <p className="text-slate-600">
                    {email && (
                      <>Processando descadastro para: <br />
                      <span className="font-medium text-slate-800">{email}</span></>
                    )}
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleUnsubscribe}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-medium"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processando...</span>
                      </div>
                    ) : (
                      'Confirmar Descadastro'
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => window.location.href = 'https://fly2any.com'}
                    variant="outline"
                    className="w-full border-2 border-slate-300 hover:border-slate-500 hover:bg-slate-50 transition-all duration-200 rounded-xl px-6 py-3 font-medium"
                  >
                    Manter Inscrição
                  </Button>
                </div>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl text-green-600">✅</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-green-700 mb-2">
                    Descadastro Realizado!
                  </h2>
                  <p className="text-slate-600 mb-4">
                    Seu email foi removido com sucesso da nossa lista de marketing.
                  </p>
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-sm text-green-700">
                      <strong>Email removido:</strong><br />
                      {email}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">
                    Você não receberá mais emails promocionais da Fly2Any.
                    Emails transacionais (confirmações de compra) ainda podem ser enviados.
                  </p>
                  
                  <Button
                    onClick={() => window.location.href = 'https://fly2any.com'}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-medium"
                  >
                    Voltar ao Site
                  </Button>
                </div>
              </div>
            )}

            {/* Not Found State */}
            {status === 'not-found' && (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl text-yellow-600">⚠️</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-yellow-700 mb-2">
                    Email Não Encontrado
                  </h2>
                  <p className="text-slate-600 mb-4">
                    O email informado não foi encontrado em nossa base de dados.
                  </p>
                  {email && (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <p className="text-sm text-yellow-700">
                        <strong>Email pesquisado:</strong><br />
                        {email}
                      </p>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={() => window.location.href = 'https://fly2any.com'}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-medium"
                >
                  Voltar ao Site
                </Button>
              </div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <div className="space-y-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl text-red-600">❌</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-red-700 mb-2">
                    Erro no Descadastro
                  </h2>
                  <p className="text-slate-600 mb-4">
                    Ocorreu um erro ao processar seu descadastro. Tente novamente ou entre em contato conosco.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Button
                    onClick={handleUnsubscribe}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3 rounded-xl font-medium"
                  >
                    Tentar Novamente
                  </Button>
                  
                  <Button
                    onClick={() => window.location.href = 'mailto:contato@fly2any.com?subject=Problema com Descadastro'}
                    variant="outline"
                    className="w-full border-2 border-slate-300 hover:border-slate-500 hover:bg-slate-50 transition-all duration-200 rounded-xl px-6 py-3 font-medium"
                  >
                    Contatar Suporte
                  </Button>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500">
                © 2024 Fly2Any - Turismo Internacional
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}