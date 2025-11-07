'use client';

/**
 * Language Detection Popup - Demo Page
 *
 * Test the language detection popup with various scenarios
 */

import React, { useState } from 'react';
import LanguageDetectionPopup from '@/components/language/LanguageDetectionPopup';
import { detectLanguage, SupportedLanguage } from '@/lib/ai/language-detection';

export default function LanguageDetectionDemoPage() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [showPopup, setShowPopup] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<SupportedLanguage>('en');
  const [confidence, setConfidence] = useState(0);
  const [testInput, setTestInput] = useState('');
  const [detectionResults, setDetectionResults] = useState<any>(null);

  const testMessages = {
    english: "Hi! I need to book a flight from New York to London for next week. Can you help me find the best deals?",
    spanish: "¡Hola! Necesito reservar un vuelo de Madrid a Barcelona para la próxima semana. ¿Puedes ayudarme?",
    portuguese: "Olá! Preciso reservar um voo do Rio de Janeiro para São Paulo na próxima semana. Você pode me ajudar?"
  };

  const handleTestMessage = (message: string) => {
    const detection = detectLanguage(message);
    setDetectionResults(detection);

    if (detection.confidence > 0.8 && detection.language !== currentLanguage) {
      setDetectedLanguage(detection.language);
      setConfidence(detection.confidence);
      setShowPopup(true);
    }
  };

  const handleConfirm = (language: string) => {
    setCurrentLanguage(language as SupportedLanguage);
    setShowPopup(false);
    alert(`Language switched to: ${language.toUpperCase()}`);
  };

  const handleDismiss = () => {
    setShowPopup(false);
    alert('Language detection dismissed');
  };

  const resetDemo = () => {
    // Clear all storage
    localStorage.removeItem('fly2any_language_detection_dismissed');
    sessionStorage.removeItem('fly2any_language_popup_shown');
    setShowPopup(false);
    setDetectionResults(null);
    setTestInput('');
    alert('Demo reset! You can now test the popup again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Language Detection Popup Demo
          </h1>
          <p className="text-lg text-gray-600">
            Test the automatic language detection system
          </p>
        </div>

        {/* Current Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Current Language</p>
              <p className="text-2xl font-bold text-blue-600">{currentLanguage.toUpperCase()}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Popup Status</p>
              <p className="text-2xl font-bold text-purple-600">
                {showPopup ? 'Showing' : 'Hidden'}
              </p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Session Shown</p>
              <p className="text-2xl font-bold text-pink-600">
                {sessionStorage.getItem('fly2any_language_popup_shown') ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Test Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Tests</h2>
          <p className="text-gray-600 mb-4">
            Click a button to simulate a user message in that language:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleTestMessage(testMessages.english)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              🇺🇸 Test English
            </button>
            <button
              onClick={() => handleTestMessage(testMessages.spanish)}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              🇪🇸 Test Spanish
            </button>
            <button
              onClick={() => handleTestMessage(testMessages.portuguese)}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              🇧🇷 Test Portuguese
            </button>
          </div>
        </div>

        {/* Custom Input */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Input</h2>
          <p className="text-gray-600 mb-4">
            Type your own message to test language detection:
          </p>
          <textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Type a message in English, Spanish, or Portuguese..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            onClick={() => testInput && handleTestMessage(testInput)}
            disabled={!testInput.trim()}
            className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed"
          >
            Test Detection
          </button>
        </div>

        {/* Detection Results */}
        {detectionResults && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detection Results</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">Detected Language:</span>
                <span className="text-green-600 font-bold text-lg">
                  {detectionResults.language.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700 font-medium">Confidence:</span>
                <span className="text-blue-600 font-bold text-lg">
                  {Math.round(detectionResults.confidence * 100)}%
                </span>
              </div>
              {detectionResults.alternateLanguages.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium mb-2 block">Alternate Languages:</span>
                  {detectionResults.alternateLanguages.map((alt: any) => (
                    <div key={alt.language} className="flex justify-between text-sm text-gray-600 ml-4">
                      <span>{alt.language.toUpperCase()}</span>
                      <span>{Math.round(alt.confidence * 100)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reset Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reset Demo</h2>
          <p className="text-gray-600 mb-4">
            Clear all storage and reset the demo to test the popup again:
          </p>
          <button
            onClick={resetDemo}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Reset Everything
          </button>
        </div>

        {/* Info */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <ul className="space-y-2 text-blue-50">
            <li>✅ Popup shows when confidence &gt; 80%</li>
            <li>✅ Only appears once per session</li>
            <li>✅ Auto-dismisses after 10 seconds</li>
            <li>✅ Remembers dismissals in localStorage</li>
            <li>✅ Won't show if detected language = current language</li>
            <li>✅ Smooth slide-up animation</li>
            <li>✅ Mobile responsive (bottom sheet on mobile)</li>
          </ul>
        </div>
      </div>

      {/* Language Detection Popup */}
      {showPopup && (
        <LanguageDetectionPopup
          detectedLanguage={detectedLanguage}
          confidence={confidence}
          onConfirm={handleConfirm}
          onDismiss={handleDismiss}
          currentLanguage={currentLanguage}
        />
      )}
    </div>
  );
}
