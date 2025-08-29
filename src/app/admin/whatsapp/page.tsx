'use client';

import React, { useState, useEffect } from 'react';

export default function WhatsAppAdmin() {
  const [status, setStatus] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const checkStatus = async (): Promise<void> => {
    try {
      const response = await fetch('/api/whatsapp/status');
      const data = await response.json();
      console.log('Status received:', data); // Debug log
      setStatus(data);
      setLastUpdate(new Date());
      
      // Atualizar QR Code baseado no status
      if (data.success && data.status) {
        const qrFromBaileys = data.status.baileys?.qrCode;
        console.log('QR Code from Baileys:', qrFromBaileys ? 'Available' : 'Not available'); // Debug log
        if (qrFromBaileys) {
          setQrCode(qrFromBaileys);
        } else {
          setQrCode('');
        }
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  const initializeWhatsApp = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch('/api/whatsapp/init', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        setStatus(data);
        if (data.qrCode) {
          setQrCode(data.qrCode);
        }
        alert('WhatsApp inicializado! Escaneie o QR code.');
      } else {
        alert('Erro: ' + data.error);
      }
    } catch (error) {
      alert('Erro ao inicializar WhatsApp');
    }
    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
    // Verificar status a cada 3 segundos para atualizações mais rápidas
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🚀 WhatsApp Admin - Fly2Any</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">📊 Status WhatsApp</h2>
          
          {status ? (
            <div className="space-y-3">
              <p><strong>Modo Ativo:</strong> 
                <span className={`ml-2 px-2 py-1 rounded ${
                  status.status?.activeMode === 'baileys' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {status.status?.activeMode === 'baileys' ? '✅ WhatsApp Real' : '⚠️ Simulação'}
                </span>
              </p>
              
              {status.status?.baileys && (
                <div className="space-y-2">
                  <p><strong>Baileys:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded ${
                      status.status.baileys.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {status.status.baileys.connected ? '✅ Conectado' : '❌ Desconectado'}
                    </span>
                  </p>
                  
                  <p><strong>Estado:</strong> 
                    <span className="ml-2 font-mono text-sm">
                      {status.status.baileys.connectionState}
                    </span>
                  </p>
                  
                  <p><strong>QR Code:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded ${
                      status.status.baileys.qrCode ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {status.status.baileys.qrCode ? '📱 Disponível' : '❌ Não disponível'}
                    </span>
                  </p>
                </div>
              )}
              
              <p className="text-xs text-gray-500">
                Última atualização: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Nunca'}
                <span className="ml-2 animate-pulse">🔄</span>
              </p>
            </div>
          ) : (
            <p className="text-gray-500">⏳ Carregando status...</p>
          )}

          <div className="mt-6 space-y-3">
            <button
              onClick={initializeWhatsApp}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '⏳ Inicializando...' : '🚀 Inicializar WhatsApp'}
            </button>
            
            <button
              onClick={checkStatus}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              🔄 Atualizar Status
            </button>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">📱 QR Code</h2>
          
          {qrCode ? (
            <div className="text-center">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block">
                <img 
                  src={`data:image/png;base64,${qrCode}`} 
                  alt="WhatsApp QR Code"
                  className="w-64 h-64 mx-auto"
                />
              </div>
              
              <p className="mt-4 text-sm text-gray-600">
                📱 Abra o WhatsApp no seu celular<br/>
                👆 Vá em <strong>⋮ → Dispositivos conectados → Conectar dispositivo</strong><br/>
                📷 Escaneie este QR code
              </p>
              
              <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">✅ Sistema WhatsApp Ativo</h4>
                <ul className="text-left text-sm text-green-700 space-y-1">
                  <li>• QR code real do WhatsApp gerado pelo Baileys</li>
                  <li>• Mensagens serão processadas automaticamente pelo N8N</li>
                  <li>• Auto-resposta inteligente configurada</li>
                  <li>• Sistema de tickets integrado</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>🔄 Nenhum QR code disponível</p>
              <p className="text-sm mt-2">
                Status: {status?.status?.baileys?.connectionState || 'Desconhecido'}
              </p>
              <p className="text-sm mt-1">
                {status?.status?.baileys?.connected ? 
                  '✅ Conectado - QR code não necessário' : 
                  'Clique em "Inicializar WhatsApp" para gerar QR code'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">📋 Como usar:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Clique em "Inicializar WhatsApp" para gerar o QR code</li>
          <li>Abra o WhatsApp no seu celular</li>
          <li>Vá em <strong>⋮ (menu) → Dispositivos conectados → Conectar dispositivo</strong></li>
          <li>Escaneie o QR code que aparece aqui</li>
          <li>Aguarde a confirmação de conexão</li>
          <li>Pronto! O sistema está ativo e receberá mensagens automaticamente</li>
        </ol>
      </div>
    </div>
  );
}