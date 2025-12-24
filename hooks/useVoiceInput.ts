/**
 * Voice Input Hook - Browser Speech-to-Text
 *
 * Uses Web Speech API (free, browser-native)
 * Falls back gracefully if unsupported
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { normalizeVoiceInput, detectLanguageFromVoice, detectEmotionFromVoice } from '@/lib/ai/voice-input';

export interface VoiceInputState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
  language: string;
  emotion: string | null;
  confidence: number;
}

export interface UseVoiceInputOptions {
  language?: string;
  continuous?: boolean;
  onTranscript?: (text: string, metadata: { language: string; emotion: string | null }) => void;
  onError?: (error: string) => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const { language = 'en-US', continuous = false, onTranscript, onError } = options;

  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    language: language.split('-')[0],
    emotion: null,
    confidence: 0,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setState(s => ({ ...s, isSupported: !!SpeechRecognition }));
  }, []);

  // Initialize recognition
  const initRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setState(s => ({ ...s, isListening: true, error: null }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;

          // Process through voice-input layer
          const normalized = normalizeVoiceInput(result[0].transcript);
          const detectedLang = detectLanguageFromVoice(normalized.text);
          const emotion = detectEmotionFromVoice(normalized.text);

          setState(s => ({
            ...s,
            transcript: normalized.text,
            confidence: result[0].confidence || 0.8,
            language: detectedLang,
            emotion: emotion,
          }));

          // Callback with processed text
          onTranscript?.(normalized.text, { language: detectedLang, emotion });
        } else {
          interim += result[0].transcript;
        }
      }

      setState(s => ({ ...s, interimTranscript: interim }));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessages: Record<string, string> = {
        'not-allowed': 'Microphone access denied. Please allow microphone permission.',
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'No microphone found. Please check your device.',
        'network': 'Network error. Please check your connection.',
        'aborted': 'Speech recognition was aborted.',
      };

      const errorMsg = errorMessages[event.error] || `Error: ${event.error}`;
      setState(s => ({ ...s, error: errorMsg, isListening: false }));
      onError?.(errorMsg);
    };

    recognition.onend = () => {
      setState(s => ({ ...s, isListening: false }));
    };

    return recognition;
  }, [language, continuous, onTranscript, onError]);

  // Start listening
  const startListening = useCallback(async () => {
    // Request microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      const errorMsg = 'Microphone access denied';
      setState(s => ({ ...s, error: errorMsg }));
      onError?.(errorMsg);
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    // Initialize and start
    recognitionRef.current = initRecognition();
    if (recognitionRef.current) {
      setState(s => ({ ...s, transcript: '', interimTranscript: '', error: null }));
      recognitionRef.current.start();

      // Auto-stop after 30 seconds (prevent infinite listening)
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, 30000);
    }
  }, [initRecognition, onError]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
  };
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
