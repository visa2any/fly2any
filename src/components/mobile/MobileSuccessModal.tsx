'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckIcon,
  XMarkIcon,
  SparklesIcon,
  ClockIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface MobileSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadData?: {
    nome?: string;
    email?: string;
    servicos?: string[];
    leadId?: string;
  };
}

export default function MobileSuccessModal({ isOpen, onClose, leadData }: MobileSuccessModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      
      const stepTimer = setTimeout(() => setCurrentStep(1), 800);
      const finalTimer = setTimeout(() => setCurrentStep(2), 1600);
      
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 200]);
      }
      
      return () => {
        clearTimeout(stepTimer);
        clearTimeout(finalTimer);
      };
    }
  }, [isOpen]);

  const serviceEmojis = {
    voos: '✈️',
    hoteis: '🏨',
    carros: '🚗',
    passeios: '🎯',
    seguro: '🛡️'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-3"
          style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(6px)' }}
        >
          {/* Mobile Optimized Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              duration: 0.3
            }}
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.96) 100%)',
              maxHeight: '80vh'
            }}
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
            >
              <XMarkIcon className="w-4 h-4 text-neutral-600" />
            </motion.button>

            {/* Compact Content */}
            <div className="p-6 text-center">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring',
                  damping: 15,
                  delay: 0.1
                }}
                className="relative mx-auto mb-4 w-16 h-16"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-success-400 to-success-600 rounded-full shadow-lg" />
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <CheckIcon className="w-6 h-6 text-success-600" strokeWidth={3} />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-primary-600 mb-2"
              >
                Solicitação Enviada! 🎉
              </motion.h2>

              {/* Personalized Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-neutral-600 mb-4 text-sm leading-relaxed"
              >
                {leadData?.nome ? (
                  <>Obrigado, <span className="font-semibold text-primary-600">{leadData.nome}</span>!</>
                ) : (
                  'Sua solicitação foi enviada!'
                )}
              </motion.p>

              {/* Compact Services */}
              {leadData?.servicos && leadData.servicos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-4 p-3 bg-gradient-to-r from-primary-50/80 to-accent-50/80 rounded-xl border border-primary-100/50"
                >
                  <div className="flex flex-wrap gap-1 justify-center">
                    {leadData.servicos.slice(0, 3).map((servico, index) => (
                      <span
                        key={servico}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white/80 rounded-full text-xs font-medium text-primary-700 shadow-sm"
                      >
                        <span>{serviceEmojis[servico as keyof typeof serviceEmojis] || '✨'}</span>
                        {servico.charAt(0).toUpperCase() + servico.slice(1)}
                      </span>
                    ))}
                    {leadData.servicos.length > 3 && (
                      <span className="text-xs text-neutral-500">+{leadData.servicos.length - 3} mais</span>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Compact Progress */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="space-y-2 mb-4"
              >
                {[
                  { icon: CheckIcon, text: 'Recebido', completed: true },
                  { icon: ClockIcon, text: 'Em análise', completed: currentStep >= 1 },
                  { icon: PhoneIcon, text: 'Retorno até 2h', completed: currentStep >= 2 }
                ].map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                      step.completed ? 'text-success-700' : 'text-neutral-400'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      step.completed ? 'bg-success-500 text-white' : 'bg-neutral-200 text-neutral-500'
                    }`}>
                      <step.icon className="w-3 h-3" strokeWidth={2} />
                    </div>
                    <span className="font-medium">{step.text}</span>
                  </div>
                ))}
              </motion.div>

              {/* Protocol Number - Compact */}
              {leadData?.leadId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mb-4 p-2 bg-neutral-50 rounded-lg"
                >
                  <p className="text-xs text-neutral-500">Protocolo</p>
                  <p className="font-mono text-sm font-semibold text-neutral-700">{leadData.leadId}</p>
                </motion.div>
              )}

              {/* Compact Action Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="space-y-2"
              >
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-center gap-2">
                    <SparklesIcon className="w-4 h-4" />
                    Continuar
                  </div>
                </motion.button>

                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full text-neutral-600 py-2 px-4 rounded-lg font-medium text-sm hover:bg-neutral-50 transition-colors"
                >
                  Voltar ao Início
                </button>
              </motion.div>

              {/* Compact Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-4 pt-4 border-t border-neutral-200/50 text-center"
              >
                <p className="text-xs text-neutral-500">
                  Fly2Any - Sua viagem dos sonhos ✈️
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}