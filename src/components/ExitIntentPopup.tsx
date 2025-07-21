'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ExitIntentPopupProps {
  enabled?: boolean;
  delay?: number; // delay in seconds before showing
}

export default function ExitIntentPopup({ enabled = true, delay = 30 }: ExitIntentPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (!enabled || hasShown) return;

    let hasTriggered = false;

    // Show after delay
    const delayTimeout = setTimeout(() => {
      if (!hasTriggered) {
        setIsVisible(true);
        setHasShown(true);
        hasTriggered = true;
      }
    }, delay * 1000);

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggered) {
        clearTimeout(delayTimeout);
        setIsVisible(true);
        setHasShown(true);
        hasTriggered = true;
      }
    };

    // Scroll detection - show when user scrolls 70% of page
    const handleScroll = () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrolled > 70 && !hasTriggered) {
        clearTimeout(delayTimeout);
        setIsVisible(true);
        setHasShown(true);
        hasTriggered = true;
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearTimeout(delayTimeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [enabled, delay, hasShown]);

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
          whatsapp,
          source: 'exit_intent_popup',
          serviceType: 'special_offer',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao enviar lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Oferta Garantida!
          </h2>
          <p className="text-gray-600 mb-4">
            Você receberá nossa oferta especial no seu email e WhatsApp em alguns minutos!
          </p>
          <div className="text-sm text-gray-500">
            Verifique sua caixa de entrada e salve nosso contato ❤️
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full relative overflow-hidden">
        {/* Header with urgency */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 text-center">
          <div className="text-2xl mb-1">⚠️ ESPERE!</div>
          <div className="font-bold text-lg">Não perca esta oportunidade única!</div>
        </div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200 z-10"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🎁</div>
            <div className="bg-yellow-400 text-black px-4 py-2 rounded-full inline-block text-sm font-bold mb-3 animate-pulse">
              OFERTA EXCLUSIVA - APENAS HOJE
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Antes de sair...
            </h2>
            <p className="text-gray-600 mb-4">
              Que tal economizar <strong className="text-red-500">até R$ 2.500</strong> na sua próxima viagem?
            </p>

            {/* Social proof */}
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-blue-600">15.000+</div>
                  <div className="text-gray-600">Viajantes</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-600">R$ 8.5M</div>
                  <div className="text-gray-600">Economizados</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-600">4.9★</div>
                  <div className="text-gray-600">Avaliação</div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📧 Seu melhor email:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu email aqui"
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📱 WhatsApp (opcional - para ofertas VIP):
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+55 (11) 99999-9999"
                className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:transform-none text-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processando...</span>
                </div>
              ) : (
                '🚀 SIM! QUERO ECONOMIZAR R$ 2.500'
              )}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold text-gray-800 text-center mb-3">
              O que você vai receber:
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span>Ofertas exclusivas de passagens com até 70% OFF</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span>Promoções relâmpago de hotéis (até 80% OFF)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span>Pacotes completos com desconto especial</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span>Alertas de error fare (passagens com preço de erro)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-500">✅</span>
                <span>Consultoria gratuita para sua viagem</span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              🔒 Seus dados estão seguros • 📧 Sem spam • ❌ Cancele quando quiser
            </p>
          </div>

          {/* Urgency timer */}
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <div className="text-red-600 font-semibold text-sm">
              ⏰ Esta oferta expira em algumas horas!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}