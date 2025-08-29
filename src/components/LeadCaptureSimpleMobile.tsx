'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface LeadCaptureSimpleMobileProps {
  onSubmit?: (data: {
    name: string;
    email: string;
    phone?: string;
  }) => void;
  className?: string;
}

const LeadCaptureSimpleMobile: React.FC<LeadCaptureSimpleMobileProps> = ({
  onSubmit,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit?.(formData);
      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', email: '', phone: '' });
      }, 3000);
    } catch (error) {
      console.error('Error submitting lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-green-50 border border-green-200 rounded-lg p-6 text-center ${className}`}
      >
        <div className="text-green-600 text-xl mb-2">✅</div>
        <h3 className="text-green-800 font-semibold mb-1">
          Obrigado!
        </h3>
        <p className="text-green-700 text-sm">
          Entraremos em contato em breve com as melhores ofertas!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-lg p-6 ${className}`}
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        🎯 Receba as Melhores Ofertas
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Seu nome"
            value={formData.name}
            onChange={handleInputChange('name')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            required
          />
        </div>
        
        <div>
          <input
            type="email"
            placeholder="Seu email"
            value={formData.email}
            onChange={handleInputChange('email')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            required
          />
        </div>
        
        <div>
          <input
            type="tel"
            placeholder="WhatsApp (opcional)"
            value={formData.phone}
            onChange={handleInputChange('phone')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
          />
        </div>
        
        <button
          type="submit"
          disabled={!formData.name || !formData.email || isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-200 min-h-[48px] flex items-center justify-center"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Enviando...</span>
            </div>
          ) : (
            '✈️ Quero as Ofertas!'
          )}
        </button>
      </form>
      
      <p className="text-xs text-gray-500 text-center mt-3">
        📱 Sem spam. Apenas as melhores promoções de viagem!
      </p>
    </motion.div>
  );
};