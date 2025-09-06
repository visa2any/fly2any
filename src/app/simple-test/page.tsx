'use client';
export const dynamic = 'force-dynamic';

import React, { useState, ChangeEvent } from 'react';

export default function SimpleTestPage() {
  const [email, setEmail] = useState('fly2any.travel@gmail.com');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const sendEmail = async (): Promise<void> => {
    setLoading(true);
    setStatus('Enviando...');
    
    try {
      const response = await fetch('/api/simple-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setStatus(`✅ SUCESSO! ID: ${result.id}`);
      } else {
        setStatus(`❌ ERRO: ${result.error}`);
      }
    } catch (error) {
      setStatus(`❌ ERRO DE REDE: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">⚡ Teste Super Simples</h1>
      
      <div className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Email para teste"
        />

        <button
          onClick={sendEmail}
          disabled={loading || !email}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? '⏳ Enviando...' : '🚀 ENVIAR AGORA'}
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
      </div>
    </div>
  );
}