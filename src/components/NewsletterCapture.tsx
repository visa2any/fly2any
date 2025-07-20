'use client';

import { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface NewsletterCaptureProps {
  variant?: 'horizontal' | 'vertical' | 'popup';
  showWhatsApp?: boolean;
  className?: string;
}

export default function NewsletterCapture({ 
  variant = 'horizontal', 
  showWhatsApp = true,
  className = ''
}: NewsletterCaptureProps) {
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          whatsapp: showWhatsApp ? whatsapp : '',
          source: 'newsletter',
          serviceType: 'newsletter_subscription',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setShowForm(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao enviar newsletter:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) return null;

  if (isSuccess) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <CheckIcon className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-800">
              🎉 Bem-vindo(a) ao nosso clube VIP!
            </h3>
            <p className="text-green-700 mt-1">
              Você receberá nossas melhores ofertas em primeira mão!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const horizontalLayout = (
    <div className={`bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white ${className}`}>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="lg:flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">🎯</span>
            <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
              OFERTA EXCLUSIVA
            </span>
          </div>
          <h3 className="text-xl lg:text-2xl font-bold mb-1">
            Receba ofertas imperdíveis de viagem!
          </h3>
          <p className="text-blue-100 text-sm lg:text-base">
            <strong>Até 70% OFF</strong> em passagens + <strong>desconto exclusivo</strong> em hotéis
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="lg:flex-1 lg:max-w-md">
          <div className="flex flex-col space-y-3">
            <div className="flex space-x-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                required
              />
              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {isSubmitting ? '⏳' : '🎁 QUERO DESCONTOS'}
              </button>
            </div>
            
            {showWhatsApp && (
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp (opcional - para ofertas VIP)"
                className="px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
              />
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-3">
            <CheckIcon className="w-4 h-4 text-green-300" />
            <span className="text-xs text-blue-100">
              100% gratuito • Cancele quando quiser • Sem spam
            </span>
          </div>
        </form>
      </div>
    </div>
  );

  const verticalLayout = (
    <div className={`bg-white border-2 border-blue-200 rounded-lg p-6 text-center ${className}`}>
      <div className="mb-4">
        <div className="inline-flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-3">
          <span>🔥</span>
          <span>OFERTA LIMITADA</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          Passagens com até 70% OFF
        </h3>
        <p className="text-gray-600">
          + Cashback exclusivo + Seguro viagem grátis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Digite seu email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        
        {showWhatsApp && (
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="WhatsApp (para ofertas VIP instantâneas)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
        >
          {isSubmitting ? '⏳ Enviando...' : '🚀 QUERO MINHA OFERTA AGORA'}
        </button>
      </form>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <CheckIcon className="w-4 h-4 text-green-500" />
          <span>Ofertas exclusivas diárias</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <CheckIcon className="w-4 h-4 text-green-500" />
          <span>Primeiro acesso às promoções</span>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
          <CheckIcon className="w-4 h-4 text-green-500" />
          <span>Cancelamento fácil</span>
        </div>
      </div>
    </div>
  );

  const popupLayout = (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full relative">
        <button
          onClick={() => setShowForm(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">🎁</div>
            <div className="bg-red-500 text-white px-4 py-2 rounded-full inline-block text-sm font-bold mb-3">
              ÚLTIMA CHANCE - 24H APENAS
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Oferta Relâmpago!
            </h2>
            <p className="text-gray-600">
              <strong className="text-red-500">70% OFF</strong> em passagens + 
              <strong className="text-blue-500"> hotel grátis</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu email para receber a oferta"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            
            {showWhatsApp && (
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp (para ofertas VIP)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            )}
            
            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50"
            >
              {isSubmitting ? '⏳ Processando...' : '🔥 GARANTIR MINHA OFERTA'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              ✅ Sem spam • ✅ Cancelamento fácil • ✅ Ofertas verificadas
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  switch (variant) {
    case 'vertical':
      return verticalLayout;
    case 'popup':
      return popupLayout;
    default:
      return horizontalLayout;
  }
}