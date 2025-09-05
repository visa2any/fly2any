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
          {/* Confetti Effect */}
          {showConfetti && (
            <div className="fixed inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: Math.random() * window.innerWidth,
                    y: -20,
                    rotate: 0,
                    opacity: 1
                  }}
                  animate={{ 
                    y: window.innerHeight + 100,
                    rotate: 360,
                    opacity: 0
                  }}
                  transition={{ 
                    duration: 3,
                    delay: Math.random() * 2,
                    ease: 'linear'
                  }}
                  className="absolute text-2xl"
                  style={{ left: Math.random() * 100 + '%' }}
                >
                  {['🎉', '✨', '🎊', '💫', '🌟'][Math.floor(Math.random() * 5)]}
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
            className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
            style={{
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

            {/* Animated Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 20,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary-100/30 to-success-100/30 rounded-full blur-3xl"
              />
              <motion.div
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  rotate: [360, 180, 0]
                }}
                transition={{ 
                  duration: 15,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-accent-100/30 to-warning-100/30 rounded-full blur-3xl"
              />
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 text-center">
              {/* Success Icon with Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: 'spring',
                  damping: 15,
                  delay: 0.3
                }}
                className="relative mx-auto mb-6 w-20 h-20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-success-400 to-success-600 rounded-full shadow-xl" />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="absolute inset-2 bg-white rounded-full flex items-center justify-center"
                >
                  <CheckIcon className="w-8 h-8 text-success-600" strokeWidth={3} />
                </motion.div>
                
                {/* Floating particles */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: Math.cos(i * 45 * Math.PI / 180) * 40,
                      y: Math.sin(i * 45 * Math.PI / 180) * 40
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="absolute top-1/2 left-1/2 w-2 h-2 bg-success-400 rounded-full"
                  />
                ))}
              </motion.div>

              {/* Title with Gradient */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-2xl font-bold bg-gradient-to-r from-success-600 via-primary-600 to-accent-600 bg-clip-text text-transparent mb-3"
              >
                Solicitação Enviada! 🎉
              </motion.h2>

              {/* Personalized Message */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-neutral-600 mb-6 leading-relaxed"
              >
                {leadData?.nome ? (
                  <>Obrigado, <span className="font-semibold text-primary-600">{leadData.nome}</span>! Sua solicitação foi enviada com sucesso.</>
                ) : (
                  'Sua solicitação foi enviada com sucesso!'
                )}
              </motion.p>

              {/* Services Summary */}
              {leadData?.servicos && leadData.servicos.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mb-6 p-4 bg-gradient-to-r from-primary-50/80 to-accent-50/80 rounded-2xl border border-primary-100/50 backdrop-blur-sm"
                >
                  <p className="text-sm font-medium text-neutral-700 mb-2">Serviços Solicitados:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {leadData.servicos.map((servico, index) => (
                      <motion.span
                        key={servico}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.1 + (index * 0.1) }}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-white/80 rounded-full text-sm font-medium text-primary-700 shadow-sm border border-primary-100"
                      >
                        <span className="text-base">{serviceEmojis[servico as keyof typeof serviceEmojis] || '✨'}</span>
                        {servico.charAt(0).toUpperCase() + servico.slice(1)}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Progress Steps */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="space-y-3 mb-6"
              >
                {[
                  { icon: CheckIcon, text: 'Solicitação recebida', completed: true },
                  { icon: ClockIcon, text: 'Em análise pela nossa equipe', completed: currentStep >= 1 },
                  { icon: PhoneIcon, text: 'Retorno em até 2 horas', completed: currentStep >= 2 }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 + (index * 0.2) }}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                      step.completed 
                        ? 'bg-success-50/80 border border-success-200/50' 
                        : 'bg-neutral-50/80 border border-neutral-200/50'
                    }`}
                  >
                    <motion.div
                      animate={{ 
                        scale: step.completed ? [1, 1.2, 1] : 1,
                        rotate: step.completed ? [0, 360] : 0
                      }}
                      transition={{ 
                        duration: step.completed ? 0.6 : 0,
                        delay: step.completed ? 0.5 : 0
                      }}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        step.completed 
                          ? 'bg-success-500 text-white shadow-lg' 
                          : 'bg-neutral-300 text-neutral-600'
                      }`}
                    >
                      <step.icon className="w-4 h-4" strokeWidth={2} />
                    </motion.div>
                    <span className={`font-medium ${
                      step.completed ? 'text-success-700' : 'text-neutral-600'
                    }`}>
                      {step.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* Lead ID */}
              {leadData?.leadId && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.1 }}
                  className="mb-6 p-3 bg-neutral-50/80 rounded-xl border border-neutral-200/50"
                >
                  <p className="text-xs text-neutral-500">Número de Protocolo</p>
                  <p className="font-mono text-sm font-semibold text-neutral-700">{leadData.leadId}</p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.3 }}
                className="space-y-3"
              >
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-primary-600 to-accent-600 text-white py-4 px-6 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <SparklesIcon className="w-5 h-5" />
                    Continuar Navegando
                    <RocketLaunchIcon className="w-5 h-5" />
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => window.location.href = '/'}
                  whileHover={{ scale: 1.01, backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full text-neutral-600 py-3 px-6 rounded-xl font-medium border border-neutral-200 bg-white/50 hover:bg-white/80 transition-all duration-200"
                >
                  Voltar ao Início
                </motion.button>
              </motion.div>

              {/* Footer Benefits */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="mt-6 pt-6 border-t border-neutral-200/50 text-center space-y-2"
              >
                <div className="flex items-center justify-center gap-6 text-xs text-neutral-600">
                  <div className="flex items-center gap-1">
                    <HeartIcon className="w-4 h-4 text-red-500" />
                    <span>Atendimento Humano</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CurrencyDollarIcon className="w-4 h-4 text-green-500" />
                    <span>Sem Taxa</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-500">
                  Fly2Any - Sua viagem dos sonhos começa aqui ✈️
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}