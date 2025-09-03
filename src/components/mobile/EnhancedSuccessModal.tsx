'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  SparklesIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface EnhancedSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  serviceType?: string;
  route?: string;
  leadId?: string;
}

export default function EnhancedSuccessModal({
  isOpen,
  onClose,
  customerName = 'Cliente',
  customerEmail,
  customerPhone,
  serviceType = 'Voos',
  route,
  leadId
}: EnhancedSuccessModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setShowConfetti(true);
      
      // Progressive animation steps
      const timer1 = setTimeout(() => setCurrentStep(1), 300);
      const timer2 = setTimeout(() => setCurrentStep(2), 800);
      const timer3 = setTimeout(() => setCurrentStep(3), 1300);
      const timer4 = setTimeout(() => setShowConfetti(false), 3000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        onClick={onClose}
      >
        {/* Confetti Background Effect */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: -20,
                  rotate: 0,
                  scale: 0
                }}
                animate={{
                  y: window.innerHeight + 50,
                  rotate: 360,
                  scale: [0, 1, 1, 0]
                }}
                transition={{
                  duration: 3,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className="absolute"
              >
                {i % 4 === 0 ? '🎉' : i % 4 === 1 ? '✨' : i % 4 === 2 ? '🎊' : '⭐'}
              </motion.div>
            ))}
          </div>
        )}

        {/* Main Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 50 }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 300,
            duration: 0.4
          }}
          className="relative w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Premium Gradient Header */}
          <div className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 px-6 py-8 text-white overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full"
              />
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  x: [0, 10, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full"
              />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors z-10"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Success Icon with Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: currentStep >= 0 ? 1 : 0,
                rotate: currentStep >= 0 ? 0 : -180
              }}
              transition={{ 
                type: "spring",
                damping: 15,
                stiffness: 300,
                delay: 0.1
              }}
              className="text-center mb-6"
            >
              <div className="relative inline-block">
                <CheckCircleIconSolid className="w-20 h-20 text-white mx-auto drop-shadow-lg" />
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 w-20 h-20 border-4 border-white/30 rounded-full"
                />
              </div>
            </motion.div>

            {/* Title with Animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: currentStep >= 1 ? 1 : 0,
                y: currentStep >= 1 ? 0 : 20
              }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-2">
                🎉 Solicitação Enviada!
              </h2>
              <p className="text-white/90 text-sm">
                Parabéns {customerName}! Sua cotação de <strong>{serviceType.toLowerCase()}</strong> foi recebida com sucesso.
              </p>
            </motion.div>
          </div>

          {/* Content Area */}
          <div className="px-6 py-6 space-y-6">
            {/* What Happens Next */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ 
                opacity: currentStep >= 2 ? 1 : 0,
                x: currentStep >= 2 ? 0 : -30
              }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-emerald-500" />
                O que acontece agora?
              </h3>

              <div className="space-y-3">
                {[
                  {
                    icon: <ClockIcon className="w-5 h-5 text-blue-500" />,
                    title: "Análise em até 2 horas",
                    description: "Nossa equipe especializada já está analisando sua solicitação"
                  },
                  {
                    icon: <PhoneIcon className="w-5 h-5 text-green-500" />,
                    title: "Contato personalizado",
                    description: `Entraremos em contato via ${customerPhone ? 'WhatsApp' : 'e-mail'} com as melhores opções`
                  },
                  {
                    icon: <HeartIcon className="w-5 h-5 text-rose-500" />,
                    title: "Atendimento premium",
                    description: "Suporte dedicado durante todo o processo"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: currentStep >= 2 ? 1 : 0,
                      x: currentStep >= 2 ? 0 : -20
                    }}
                    transition={{ 
                      duration: 0.4,
                      delay: 0.7 + (index * 0.1)
                    }}
                    className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: currentStep >= 3 ? 1 : 0,
                y: currentStep >= 3 ? 0 : 20
              }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4"
            >
              <h4 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <EnvelopeIcon className="w-4 h-4 text-blue-500" />
                Seus dados de contato
              </h4>
              
              <div className="space-y-2">
                {customerEmail && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">📧</span>
                    <span className="text-gray-800">{customerEmail}</span>
                  </div>
                )}
                {customerPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">📱</span>
                    <span className="text-gray-800">{customerPhone}</span>
                  </div>
                )}
                {route && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">✈️</span>
                    <span className="text-gray-800">{route}</span>
                  </div>
                )}
              </div>

              {leadId && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-gray-500">
                    ID da solicitação: <span className="font-mono font-medium">{leadId}</span>
                  </p>
                </div>
              )}
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: currentStep >= 3 ? 1 : 0,
                y: currentStep >= 3 ? 0 : 20
              }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="space-y-3"
            >
              {/* Primary Action */}
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
              >
                ✅ Perfeito, obrigado!
              </button>

              {/* Secondary Action */}
              <button
                onClick={() => {
                  window.open('https://wa.me/5511999887766?text=Olá! Acabei de enviar uma cotação pelo site e gostaria de mais informações.', '_blank');
                  onClose();
                }}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-6 rounded-xl font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
              >
                💬 Falar no WhatsApp agora
              </button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: currentStep >= 3 ? 1 : 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="flex justify-center items-center gap-4 pt-4 border-t border-gray-100"
            >
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">4.9/5</span>
                <span>(2.847 avaliações)</span>
              </div>
              <div className="w-px h-4 bg-gray-300" />
              <div className="text-xs text-gray-500">
                🔒 <span className="font-medium">100% Seguro</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}