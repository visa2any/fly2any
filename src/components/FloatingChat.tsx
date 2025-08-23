'use client';

import { useState, useEffect } from 'react';
import { trackWhatsAppClick, trackButtonClick } from '@/lib/analytics-safe';

export default function FloatingChat() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000); // Aparece após 3 segundos

    return () => clearTimeout(timer);
  }, []);

  const handleWhatsAppClick = () => {
    trackWhatsAppClick();
    trackButtonClick('whatsapp_floating', 'floating_chat');
    window.open('https://wa.me/551151944717?text=Olá! Gostaria de solicitar uma cotação de viagem.', '_blank');
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      trackButtonClick('chat_expand', 'floating_chat');
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop quando expandido */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Widget de Chat */}
      <div className="floating-chat fixed bottom-6 right-32 z-[50]">
        {/* Chat expandido */}
        {isExpanded && (
          <div className="mb-4 bg-white rounded-2xl shadow-2xl w-96 animate-fade-in-up">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">💬</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Atendimento Fly2Any</h3>
                    <p className="text-green-100 text-sm">Online agora</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="text-white/70 hover:text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    F
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 flex-1">
                    <p className="text-gray-800 text-sm">
                      Olá! 👋 Sou da equipe Fly2Any. 
                      Como posso ajudar com sua viagem hoje?
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <button 
                    onClick={handleWhatsAppClick}
                    className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                  >
                    <span className="text-green-700 text-sm">✈️ Solicitar cotação de voos</span>
                  </button>
                  
                  <button 
                    onClick={handleWhatsAppClick}
                    className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                  >
                    <span className="text-green-700 text-sm">🏨 Reservar hotéis</span>
                  </button>
                  
                  <button 
                    onClick={handleWhatsAppClick}
                    className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
                  >
                    <span className="text-green-700 text-sm">❓ Outras dúvidas</span>
                  </button>
                </div>
                
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all"
                >
                  💬 Continuar no WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botão principal */}
        <div className="relative">
          {/* Pulso de notificação */}
          {!isExpanded && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">1</span>
            </div>
          )}
          
          <button
            onClick={toggleExpanded}
            className="group relative w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center transform hover:scale-110"
            style={{
              animation: 'float 6s ease-in-out infinite',
            }}
          >
            <span className="text-white text-3xl group-hover:scale-110 transition-transform">
              {isExpanded ? '✕' : '💬'}
            </span>
            
            {/* Ripple effect */}
            <div className="absolute inset-2 rounded-full bg-green-400 opacity-20 animate-ping"></div>
          </button>
        </div>

        {/* Tooltip */}
        {!isExpanded && (
          <div className="absolute bottom-20 right-0 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Precisa de ajuda? Clique aqui!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
