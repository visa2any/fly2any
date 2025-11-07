'use client';

/**
 * Example Usage of LanguageDetectionPopup Component
 *
 * This file demonstrates how to integrate the language detection popup
 * into your application's chat or messaging interface.
 */

import React, { useState, useEffect } from 'react';
import LanguageDetectionPopup from './LanguageDetectionPopup';
import { detectLanguage, SupportedLanguage } from '@/lib/ai/language-detection';

export default function ChatWithLanguageDetection() {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [showLanguagePopup, setShowLanguagePopup] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<SupportedLanguage>('en');
  const [detectionConfidence, setDetectionConfidence] = useState(0);
  const [hasDetectedOnce, setHasDetectedOnce] = useState(false);

  // Simulate user sending first message
  const handleUserMessage = (userInput: string) => {
    // Add user message to chat
    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);

    // Detect language from first user message
    if (!hasDetectedOnce && messages.filter(m => m.role === 'user').length === 0) {
      const detection = detectLanguage(userInput);

      // Only show popup if confidence is high enough (>80%)
      if (detection.confidence > 0.8 && detection.language !== currentLanguage) {
        setDetectedLanguage(detection.language);
        setDetectionConfidence(detection.confidence);
        setShowLanguagePopup(true);
        setHasDetectedOnce(true);
      }
    }
  };

  // Handle language confirmation
  const handleLanguageConfirm = (language: string) => {
    setCurrentLanguage(language as SupportedLanguage);
    setShowLanguagePopup(false);

    // Optionally, add a system message confirming the language change
    setMessages(prev => [
      ...prev,
      {
        role: 'system',
        content: `Language changed to ${language.toUpperCase()}`,
      },
    ]);

    // You might want to send this preference to your backend
    console.log('User confirmed language:', language);
  };

  // Handle popup dismissal
  const handleLanguageDismiss = () => {
    setShowLanguagePopup(false);
    console.log('User dismissed language detection');
  };

  return (
    <div className="relative">
      {/* Your chat interface */}
      <div className="chat-container">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            {msg.content}
          </div>
        ))}
      </div>

      {/* Language Detection Popup */}
      {showLanguagePopup && (
        <LanguageDetectionPopup
          detectedLanguage={detectedLanguage}
          confidence={detectionConfidence}
          onConfirm={handleLanguageConfirm}
          onDismiss={handleLanguageDismiss}
          currentLanguage={currentLanguage}
        />
      )}

      {/* Example: Simulate first message for demo */}
      <button
        onClick={() => handleUserMessage('Hola, necesito un vuelo a Madrid')}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Send Spanish Message (Demo)
      </button>
    </div>
  );
}

/**
 * Alternative: Using the useLanguageDetection Hook
 */
export function ChatWithHook() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  // Simple approach using provided hook
  const {
    showPopup,
    detectedLang,
    confidence,
    triggerLanguageDetection,
    handleConfirm,
    handleDismiss,
  } = useLanguageDetection();

  const onUserMessage = (text: string) => {
    const detection = detectLanguage(text);

    if (detection.confidence > 0.8) {
      triggerLanguageDetection(detection.language, detection.confidence);
    }
  };

  const handleLanguageSwitch = (language: string) => {
    setCurrentLanguage(language as SupportedLanguage);
    handleConfirm(language);
  };

  return (
    <div>
      {/* Your UI */}

      {showPopup && (
        <LanguageDetectionPopup
          detectedLanguage={detectedLang}
          confidence={confidence}
          onConfirm={handleLanguageSwitch}
          onDismiss={handleDismiss}
          currentLanguage={currentLanguage}
        />
      )}
    </div>
  );
}

/**
 * Integration with Next.js App Router
 *
 * In your main chat page (e.g., app/chat/page.tsx):
 *
 * import LanguageDetectionPopup from '@/components/language/LanguageDetectionPopup';
 * import { detectLanguage } from '@/lib/ai/language-detection';
 *
 * export default function ChatPage() {
 *   // Your chat logic...
 *
 *   const handleFirstMessage = (message: string) => {
 *     const detection = detectLanguage(message);
 *
 *     if (detection.confidence > 0.8) {
 *       // Show popup...
 *     }
 *   };
 *
 *   return (
 *     <>
 *       <YourChatUI />
 *       <LanguageDetectionPopup {...popupProps} />
 *     </>
 *   );
 * }
 */

function useLanguageDetection(): {
  showPopup: boolean;
  detectedLang: SupportedLanguage;
  confidence: number;
  triggerLanguageDetection: (language: SupportedLanguage, confidenceLevel: number) => void;
  handleConfirm: (language: string) => void;
  handleDismiss: () => void;
} {
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
  };

  const handleDismiss = () => {
    setShowPopup(false);
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
