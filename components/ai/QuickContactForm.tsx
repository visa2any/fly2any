'use client';

import { useState } from 'react';
import { User, Mail, Phone, Gift } from 'lucide-react';

interface QuickContactFormProps {
  onSubmit: (data: { name: string; email: string; phone: string }) => void;
  stage: 'interested' | 'engaged' | 'converting';
  language?: 'en' | 'pt' | 'es';
}

export function QuickContactForm({ onSubmit, stage, language = 'en' }: QuickContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    setIsSubmitting(true);
    await onSubmit({ name, email, phone });
    setIsSubmitting(false);
  };

  // Stage-based messaging
  const getMessages = () => {
    if (language === 'pt') {
      return {
        interested: {
          title: '💡 Conta Gratuita',
          subtitle: 'Salve suas pesquisas e obtenha ofertas personalizadas!',
          benefit: null
        },
        engaged: {
          title: '🎁 10% de Desconto na Primeira Reserva!',
          subtitle: 'Crie sua conta e desbloqueie ofertas exclusivas',
          benefit: '+ Suporte prioritário e histórico de viagens'
        },
        converting: {
          title: '⭐ Bem-vindo ao Clube VIP!',
          subtitle: 'Desbloqueie todos os recursos premium',
          benefit: '✨ 10% OFF + Ofertas exclusivas + Suporte VIP'
        }
      };
    } else if (language === 'es') {
      return {
        interested: {
          title: '💡 Cuenta Gratuita',
          subtitle: '¡Guarda tus búsquedas y obtén ofertas personalizadas!',
          benefit: null
        },
        engaged: {
          title: '🎁 ¡10% de Descuento en tu Primera Reserva!',
          subtitle: 'Crea tu cuenta y desbloquea ofertas exclusivas',
          benefit: '+ Soporte prioritario e historial de viajes'
        },
        converting: {
          title: '⭐ ¡Bienvenido al Club VIP!',
          subtitle: 'Desbloquea todas las funciones premium',
          benefit: '✨ 10% OFF + Ofertas exclusivas + Soporte VIP'
        }
      };
    } else {
      return {
        interested: {
          title: '💡 Free Account',
          subtitle: 'Save your searches and get personalized deals!',
          benefit: null
        },
        engaged: {
          title: '🎁 10% OFF Your First Booking!',
          subtitle: 'Create your account and unlock exclusive offers',
          benefit: '+ Priority support & travel history'
        },
        converting: {
          title: '⭐ Welcome to VIP Club!',
          subtitle: 'Unlock all premium features',
          benefit: '✨ 10% OFF + Exclusive deals + VIP support'
        }
      };
    }
  };

  const messages = getMessages()[stage];
  const labels = {
    en: { name: 'Your Name', email: 'Email Address', phone: 'Phone Number', submit: 'Get My Benefits', skip: 'Maybe Later' },
    pt: { name: 'Seu Nome', email: 'Endereço de Email', phone: 'Número de Telefone', submit: 'Obter Benefícios', skip: 'Talvez Mais Tarde' },
    es: { name: 'Tu Nombre', email: 'Correo Electrónico', phone: 'Número de Teléfono', submit: 'Obtener Beneficios', skip: 'Quizás Más Tarde' }
  }[language];

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-lg border-2 border-primary-200 p-3 shadow-md">
      {/* Header */}
      <div className="text-center mb-3">
        <h3 className="text-sm font-bold text-gray-900 mb-0.5">
          {messages.title}
        </h3>
        <p className="text-[10px] text-gray-600">
          {messages.subtitle}
        </p>
        {messages.benefit && (
          <div className="mt-1 px-2 py-1 bg-green-100 rounded text-[9px] font-semibold text-green-800">
            {messages.benefit}
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        {/* Name */}
        <div className="relative">
          <User className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={labels.name}
            required
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={labels.email}
            required
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Phone */}
        <div className="relative">
          <Phone className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={labels.phone}
            required
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting || !name || !email || !phone}
            className="flex-1 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-md transition-all text-xs flex items-center justify-center gap-1"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{language === 'pt' ? 'Enviando...' : language === 'es' ? 'Enviando...' : 'Submitting...'}</span>
              </>
            ) : (
              <>
                <Gift className="w-3 h-3" />
                <span>{labels.submit}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Privacy Note */}
      <p className="text-[8px] text-gray-500 text-center mt-2">
        {language === 'pt'
          ? '🔒 Suas informações estão seguras. Não compartilhamos com terceiros.'
          : language === 'es'
          ? '🔒 Tu información está segura. No la compartimos con terceros.'
          : '🔒 Your info is secure. We never share with third parties.'}
      </p>
    </div>
  );
}
