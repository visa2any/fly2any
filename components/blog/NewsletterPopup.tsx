'use client';

import { useState, useEffect } from 'react';

interface NewsletterPopupProps {
  onSubscribe: (email: string) => void;
  onClose: () => void;
  delayMs?: number; // Delay before showing popup
  showOnExit?: boolean; // Show on exit intent
  language?: 'en' | 'pt' | 'es';
}

export function NewsletterPopup({
  onSubscribe,
  onClose,
  delayMs = 5000,
  showOnExit = true,
  language = 'en',
}: NewsletterPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translations = {
    en: {
      title: "Don't Miss Out!",
      subtitle: 'Get exclusive travel deals & tips delivered to your inbox',
      emailPlaceholder: 'Enter your email',
      subscribe: 'Subscribe Now',
      noThanks: 'No thanks',
      benefits: [
        'Exclusive flight deals',
        'Travel tips & guides',
        'Early access to flash sales',
      ],
    },
    pt: {
      title: 'Não Perca!',
      subtitle: 'Receba ofertas exclusivas de viagem e dicas na sua caixa de entrada',
      emailPlaceholder: 'Digite seu email',
      subscribe: 'Inscrever-se Agora',
      noThanks: 'Não, obrigado',
      benefits: [
        'Ofertas exclusivas de voos',
        'Dicas e guias de viagem',
        'Acesso antecipado a vendas relâmpago',
      ],
    },
    es: {
      title: '¡No te lo pierdas!',
      subtitle: 'Recibe ofertas exclusivas de viajes y consejos en tu bandeja de entrada',
      emailPlaceholder: 'Ingresa tu email',
      subscribe: 'Suscribirse Ahora',
      noThanks: 'No gracias',
      benefits: [
        'Ofertas exclusivas de vuelos',
        'Consejos y guías de viaje',
        'Acceso anticipado a ventas flash',
      ],
    },
  };

  const t = translations[language];

  useEffect(() => {
    // Timed popup
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    // Exit intent detection
    const handleMouseLeave = (e: MouseEvent) => {
      if (showOnExit && e.clientY <= 0) {
        setIsVisible(true);
      }
    };

    if (showOnExit) {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      clearTimeout(timer);
      if (showOnExit) {
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [delayMs, showOnExit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    await onSubscribe(email);
    setIsSubmitting(false);
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 text-white text-center">
          <div className="text-5xl mb-3">✉️</div>
          <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
          <p className="text-blue-100 text-sm">{t.subtitle}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Benefits */}
          <ul className="space-y-2 mb-6">
            {t.benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 transition-colors"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-bold transition-colors"
            >
              {isSubmitting ? '...' : t.subscribe}
            </button>
          </form>

          {/* No Thanks */}
          <button
            onClick={handleClose}
            className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {t.noThanks}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
