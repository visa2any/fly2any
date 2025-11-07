'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe } from 'lucide-react';
import { SupportedLanguage, LANGUAGE_FLAGS, LANGUAGE_NAMES } from '@/lib/ai/language-detection';

interface LanguageDetectionPopupProps {
  detectedLanguage: 'en' | 'es' | 'pt';
  confidence: number;
  onConfirm: (language: string) => void;
  onDismiss: () => void;
  currentLanguage?: string;
}

interface PopupContent {
  title: string;
  message: string;
  confirmButton: string;
  dismissButton: string;
}

const POPUP_MESSAGES: Record<SupportedLanguage, PopupContent> = {
  en: {
    title: 'English Detected',
    message: 'We detected you speak English. Would you like to continue in English?',
    confirmButton: 'Yes, switch to English',
    dismissButton: 'No, stay in current language',
  },
  es: {
    title: 'Español Detectado',
    message: 'Detectamos que hablas Español. ¿Quieres continuar en Español?',
    confirmButton: 'Sí, cambiar a Español',
    dismissButton: 'No, mantener idioma actual',
  },
  pt: {
    title: 'Português Detectado',
    message: 'Detectamos que você fala Português. Quer continuar em Português?',
    confirmButton: 'Sim, mudar para Português',
    dismissButton: 'Não, manter idioma atual',
  },
};

const STORAGE_KEY = 'fly2any_language_detection_dismissed';
const SESSION_SHOWN_KEY = 'fly2any_language_popup_shown';

export default function LanguageDetectionPopup({
  detectedLanguage,
  confidence,
  onConfirm,
  onDismiss,
  currentLanguage = 'en',
}: LanguageDetectionPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if should show popup
    const shouldShow = checkShouldShow();

    if (shouldShow) {
      // Small delay before showing for better UX
      const showTimer = setTimeout(() => {
        setIsVisible(true);
        // Mark as shown for this session
        sessionStorage.setItem(SESSION_SHOWN_KEY, 'true');
      }, 500);

      // Auto-dismiss after 10 seconds
      const dismissTimer = setTimeout(() => {
        handleDismiss();
      }, 10500); // 500ms delay + 10000ms display

      return () => {
        clearTimeout(showTimer);
        clearTimeout(dismissTimer);
      };
    }
  }, []);

  const checkShouldShow = (): boolean => {
    // Don't show if confidence is too low
    if (confidence <= 0.8) {
      return false;
    }

    // Don't show if detected language is same as current
    if (detectedLanguage === currentLanguage) {
      return false;
    }

    // Don't show if already shown in this session
    if (sessionStorage.getItem(SESSION_SHOWN_KEY)) {
      return false;
    }

    // Don't show if user has permanently dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedData = JSON.parse(dismissed);
      // Check if dismissed for this language
      if (dismissedData[detectedLanguage]) {
        return false;
      }
    }

    return true;
  };

  const handleConfirm = () => {
    setIsClosing(true);
    setTimeout(() => {
      onConfirm(detectedLanguage);
      setIsVisible(false);
    }, 300);
  };

  const handleDismiss = () => {
    setIsClosing(true);

    // Save dismissal to localStorage
    const existingDismissals = localStorage.getItem(STORAGE_KEY);
    const dismissals = existingDismissals ? JSON.parse(existingDismissals) : {};
    dismissals[detectedLanguage] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissals));

    setTimeout(() => {
      onDismiss();
      setIsVisible(false);
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  const content = POPUP_MESSAGES[detectedLanguage];
  const flag = LANGUAGE_FLAGS[detectedLanguage];
  const languageName = LANGUAGE_NAMES[detectedLanguage];

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
            onClick={handleDismiss}
          />

          {/* Popup */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{
              y: isClosing ? 100 : 0,
              opacity: isClosing ? 0 : 1
            }}
            exit={{ y: 100, opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300
            }}
            className="fixed bottom-0 left-0 right-0 md:bottom-6 md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-md z-[9999]"
          >
            <div className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-200">
                <button
                  onClick={handleDismiss}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm border border-gray-200">
                    <span className="text-2xl" role="img" aria-label={languageName}>
                      {flag}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Globe size={18} className="text-blue-600" />
                      {content.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {Math.round(confidence * 100)}% confidence
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="text-gray-700 text-base leading-relaxed mb-6">
                  {content.message}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleConfirm}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {content.confirmButton}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 border border-gray-300"
                  >
                    {content.dismissButton}
                  </button>
                </div>

                {/* Auto-dismiss indicator */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Auto-dismisses in 10 seconds
                  </p>
                </div>
              </div>

              {/* Progress bar for auto-dismiss */}
              <motion.div
                className="h-1 bg-gradient-to-r from-blue-600 to-purple-600"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 10, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for easy integration
export function useLanguageDetection() {
  const [showPopup, setShowPopup] = useState(false);
  const [detectedLang, setDetectedLang] = useState<SupportedLanguage>('en');
  const [confidence, setConfidence] = useState(0);

  const triggerLanguageDetection = (
    language: SupportedLanguage,
    confidenceLevel: number
  ) => {
    setDetectedLang(language);
    setConfidence(confidenceLevel);
    setShowPopup(true);
  };

  const handleConfirm = (language: string) => {
    setShowPopup(false);
    // Language switch logic should be handled by parent
    console.log('User confirmed language switch to:', language);
  };

  const handleDismiss = () => {
    setShowPopup(false);
    console.log('User dismissed language detection');
  };

  return {
    showPopup,
    detectedLang,
    confidence,
    triggerLanguageDetection,
    handleConfirm,
    handleDismiss,
  };
}
