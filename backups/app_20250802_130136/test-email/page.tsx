'use client';

import React, { useState } from 'react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('fly2any.travel@gmail.com');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const sendTestEmail = async () => {
    setLoading(true);
    setStatus('Enviando...');
    
    try {
      const response = await fetch('/api/debug-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus(`✅ Email enviado! ID: ${result.messageId}`);
      } else {
        setStatus(`❌ Erro: ${JSON.stringify(result.error)}`);
      }
    } catch (error) {
      setStatus(`❌ Erro de rede: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">🧪 Teste Email Simples</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email para teste:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="seu@email.com"
          />
        </div>

        <button
          onClick={sendTestEmail}
          disabled={loading || !email}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : 'Enviar Teste'}
        </button>

        {status && (
          <div className={`p-3 rounded-md ${
            status.includes('✅') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {status}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p>• Usa API debug direta</p>
          <p>• Bypassa sistema complexo</p>
          <p>• Teste Resend puro</p>
        </div>
      </div>
    </div>
  );
}