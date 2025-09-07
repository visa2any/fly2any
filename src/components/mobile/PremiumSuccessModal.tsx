'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ClockIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  RocketLaunchIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

interface PremiumSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadData?: {
    nome?: string;
    email?: string;
    servicos?: string[];
    leadId?: string;
  };
}

export default function PremiumSuccessModal({ isOpen, onClose, leadData }: PremiumSuccessModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setCurrentStep(0);
      
      // Step animation sequence
      const stepTimer = setTimeout(() => setCurrentStep(1), 1000);
      const finalTimer = setTimeout(() => setCurrentStep(2), 2000);
      
      // Enhanced haptic feedback sequence
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 200, 50, 300]);
      }
      
      return () => {
        clearTimeout(stepTimer);
        clearTimeout(finalTimer);
      };
    } else {
      setShowConfetti(false);
      setCurrentStep(0);
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)' }}
        >
          {/* Simplified Confetti Effect - Mobile Optimized */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: '50%',
                    y: -10,
                    scale: 0,
                    opacity: 1
                  }}
                  animate={{ 
                    y: 100,
                    x: Math.random() > 0.5 ? '70%' : '30%',
                    scale: [0, 1, 0],
                    opacity: 0
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: i * 0.1,
                    ease: 'easeOut'
                  }}
                  className="absolute text-lg"
                >
                  {['🎉', '✨'][i % 2]}
                </motion.div>
              ))}
            </div>
          )}

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ 
              type: 'spring', 
              damping: 20, 
              stiffness: 300,
              delay: 0.1
            }}
            className="relative w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden"
            style={{
              maxHeight: '280px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
            }}
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-neutral-600" />
            </motion.button>

            {/* Simplified Background Pattern - Mobile Optimized */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-primary-100/20 to-success-100/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-accent-100/20 to-warning-100/20 rounded-full blur-2xl" />
            </div>

            {/* Content - Mobile Optimized */}
            <div className="relative z-10 p-4 text-center">
              {/* Success Icon - Simplified for Mobile */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: 'spring',
                  damping: 15,
                  delay: 0.2
                }}
                className="relative mx-auto mb-4 w-14 h-14"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-success-400 to-success-600 rounded-full shadow-lg" />
                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                  <CheckIcon className="w-6 h-6 text-success-600" strokeWidth={3} />
                </div>
              </motion.div>

              {/* Title - Mobile Optimized */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg font-bold text-success-600 mb-2"
              >
                Solicitação Enviada!
              </motion.h2>

              {/* Personalized Message - Compact */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-neutral-600 mb-3"
              >
                {leadData?.nome ? (
                  <>Obrigado, <span className="font-semibold text-primary-600">{leadData.nome}</span>!</>
                ) : (
                  'Enviado com sucesso!'
                )}
              </motion.p>

              {/* Services Summary - Compact */}
              {leadData?.servicos && leadData.servicos.length > 0 && (
                <div className="mb-3 p-2 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg border border-primary-100/50">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {leadData.servicos.map((servico) => (
                      <span
                        key={servico}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-full text-xs font-medium text-primary-700"
                      >
                        <span>{serviceEmojis[servico as keyof typeof serviceEmojis] || '✨'}</span>
                        {servico.charAt(0).toUpperCase() + servico.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress Steps - Simplified */}
              <div className="space-y-2 mb-3">
                {[
                  { icon: CheckIcon, text: 'Recebida ✓', completed: true },
                  { icon: PhoneIcon, text: 'Retorno em 2h', completed: false }
                ].map((step, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                      step.completed 
                        ? 'bg-success-50 text-success-700' 
                        : 'bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-success-500 text-white' 
                        : 'bg-neutral-300 text-neutral-600'
                    }`}>
                      <step.icon className="w-3 h-3" strokeWidth={2} />
                    </div>
                    <span className="font-medium">{step.text}</span>
                  </div>
                ))}
              </div>

              {/* Lead ID - Compact */}
              {leadData?.leadId && (
                <div className="mb-3 p-2 bg-neutral-50 rounded-lg">
                  <p className="text-xs text-neutral-500">Protocolo</p>
                  <p className="font-mono text-xs font-semibold text-neutral-700">{leadData.leadId}</p>
                </div>
              )}

              {/* Action Buttons - Compact */}
              <div className="space-y-2">
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-center gap-2">
                    <CheckIcon className="w-4 h-4" />
                    Continuar
                  </div>
                </button>
              </div>

              {/* Footer Benefits - Simplified */}
              <div className="mt-3 pt-3 border-t border-neutral-200/50 text-center">
                <div className="flex items-center justify-center gap-4 text-xs text-neutral-600">
                  <div className="flex items-center gap-1">
                    <HeartIcon className="w-3 h-3 text-red-500" />
                    <span>Humano</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CurrencyDollarIcon className="w-3 h-3 text-green-500" />
                    <span>Sem Taxa</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}