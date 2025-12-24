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

  // Use ref to track listening state to avoid stale closure
  const isListeningRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync ref with state
  useEffect(() => {
    isListeningRef.current = state.isListening;
  }, [state.isListening]);

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
      isListeningRef.current = true;
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
      isListeningRef.current = false;
      setState(s => ({ ...s, error: errorMsg, isListening: false }));
      onError?.(errorMsg);
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setState(s => ({ ...s, isListening: false, interimTranscript: '' }));
    };

    return recognition;
  }, [language, continuous, onTranscript, onError]);

  // Clear error and reset state
  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }));
  }, []);

  // Start listening
  const startListening = useCallback(async () => {
    // Clear any previous error first
    setState(s => ({ ...s, error: null }));

    // Request microphone permission - this triggers browser permission dialog
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      const errorMsg = 'Microphone access denied. Click to retry.';
      setState(s => ({ ...s, error: errorMsg, isListening: false }));
      onError?.(errorMsg);
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore abort errors
      }
      recognitionRef.current = null;
    }

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Initialize and start
    recognitionRef.current = initRecognition();
    if (recognitionRef.current) {
      setState(s => ({ ...s, transcript: '', interimTranscript: '', error: null }));

      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setState(s => ({ ...s, error: 'Failed to start voice recognition', isListening: false }));
        return;
      }

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
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors
      }
    }

    isListeningRef.current = false;
    setState(s => ({ ...s, isListening: false }));
  }, []);

  // Toggle listening - uses ref to avoid stale closure
  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
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
    clearError,
  };
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
