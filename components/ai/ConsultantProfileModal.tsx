'use client';

import { X, Briefcase, Award, Languages, MessageSquare, Mail, Phone } from 'lucide-react';
import { ConsultantAvatar } from './ConsultantAvatar';
import type { ConsultantProfile } from '@/lib/ai/consultant-profiles';

interface ConsultantProfileModalProps {
  consultant: ConsultantProfile;
  isOpen: boolean;
  onClose: () => void;
  language?: 'en' | 'pt' | 'es';
}

const translations = {
  en: {
    credentials: 'Credentials',
    expertise: 'Areas of Expertise',
    specialties: 'Specialties',
    askMeAbout: 'Ask me about...',
    contact: 'Contact',
    chat: 'Start Chat',
    close: 'Close',
  },
  pt: {
    credentials: 'Credenciais',
    expertise: 'Áreas de Especialização',
    specialties: 'Especialidades',
    askMeAbout: 'Pergunte-me sobre...',
    contact: 'Contato',
    chat: 'Iniciar Conversa',
    close: 'Fechar',
  },
  es: {
    credentials: 'Credenciales',
    expertise: 'Áreas de Especialización',
    specialties: 'Especialidades',
    askMeAbout: 'Pregúntame sobre...',
    contact: 'Contacto',
    chat: 'Iniciar Chat',
    close: 'Cerrar',
  },
};

/**
 * Consultant Profile Modal
 *
 * Shows detailed information about a consultant when their avatar is clicked
 */
export function ConsultantProfileModal({
  consultant,
  isOpen,
  onClose,
  language = 'en',
}: ConsultantProfileModalProps) {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[2000] animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[2001] flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 px-6 py-8 text-white">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
              aria-label={t.close}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Large Avatar */}
              <ConsultantAvatar
                consultantId={consultant.id}
                name={consultant.name}
                size="xl"
                showStatus={true}
                className="mb-4"
              />

              <h2 className="text-2xl font-bold mb-1">{consultant.name}</h2>
              <p className="text-primary-100 font-medium">{consultant.title}</p>
              <p className="text-primary-200 text-sm mt-2 max-w-md">
                {consultant.personality}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Expertise */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900">{t.expertise}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {consultant.expertise.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-700"
                  >
                    <span className="text-primary-500 mt-0.5">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-secondary-100 text-secondary-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900">{t.specialties}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {consultant.specialties.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-gradient-to-r from-secondary-50 to-primary-50 border border-secondary-200 text-secondary-700 text-sm font-medium rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Ask Me About */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-gray-900">{t.askMeAbout}</h3>
              </div>
              <div className="space-y-2">
                {getSuggestedQuestions(consultant, language).map((question, idx) => (
                  <button
                    key={idx}
                    className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                    onClick={() => {
                      // This would set the message in the chat input
                      onClose();
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.chat}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Get suggested questions based on consultant expertise
 */
function getSuggestedQuestions(
  consultant: ConsultantProfile,
  language: 'en' | 'pt' | 'es'
): string[] {
  const questions: Record<string, Record<string, string[]>> = {
    'flight-operations': {
      en: [
        'Find me the cheapest flight to Dubai',
        'What are the baggage policies?',
        'Can you help me change my flight?',
      ],
      pt: [
        'Encontre o voo mais barato para Dubai',
        'Quais são as políticas de bagagem?',
        'Pode me ajudar a alterar meu voo?',
      ],
      es: [
        'Encuentra el vuelo más barato a Dubai',
        '¿Cuáles son las políticas de equipaje?',
        '¿Puedes ayudarme a cambiar mi vuelo?',
      ],
    },
    'hotel-accommodations': {
      en: [
        'Show me luxury hotels in Paris',
        'What are the best family-friendly resorts?',
        'Can I get a room upgrade?',
      ],
      pt: [
        'Mostre-me hotéis de luxo em Paris',
        'Quais são os melhores resorts para famílias?',
        'Posso obter um upgrade de quarto?',
      ],
      es: [
        'Muéstrame hoteles de lujo en París',
        '¿Cuáles son los mejores resorts familiares?',
        '¿Puedo obtener una mejora de habitación?',
      ],
    },
    'legal-compliance': {
      en: [
        'Am I entitled to flight compensation?',
        'What are my refund rights?',
        'How do I file a complaint?',
      ],
      pt: [
        'Tenho direito a compensação de voo?',
        'Quais são meus direitos de reembolso?',
        'Como faço uma reclamação?',
      ],
      es: [
        '¿Tengo derecho a compensación de vuelo?',
        '¿Cuáles son mis derechos de reembolso?',
        '¿Cómo presento una queja?',
      ],
    },
    'payment-billing': {
      en: [
        'What payment methods do you accept?',
        'How do I get a refund?',
        'Can I set up a payment plan?',
      ],
      pt: [
        'Quais métodos de pagamento vocês aceitam?',
        'Como obtenho um reembolso?',
        'Posso criar um plano de pagamento?',
      ],
      es: [
        '¿Qué métodos de pago aceptan?',
        '¿Cómo obtengo un reembolso?',
        '¿Puedo configurar un plan de pago?',
      ],
    },
  };

  return (
    questions[consultant.team]?.[language] || [
      'How can you help me?',
      'What are your specialties?',
      'Tell me more about your services',
    ]
  );
}
