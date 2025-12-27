/**
 * Voice Input Hook - WhatsApp-Style Premium Voice Recording
 *
 * Features:
 * - Real-time audio level visualization
 * - Recording timer
 * - Silence detection for auto-stop
 * - Hold-to-record support
 * - Browser Speech-to-Text
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
  // WhatsApp-style features
  audioLevel: number;        // 0-100 for waveform
  recordingDuration: number; // seconds
  silenceDetected: boolean;
}

export interface UseVoiceInputOptions {
  language?: string;
  continuous?: boolean;
  silenceTimeout?: number;   // ms before auto-stop on silence
  maxDuration?: number;      // max recording duration in ms
  onTranscript?: (text: string, metadata: { language: string; emotion: string | null }) => void;
  onError?: (error: string) => void;
  onAudioLevel?: (level: number) => void;
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const {
    language = 'en-US',
    continuous = false,
    silenceTimeout = 3000,
    maxDuration = 60000,
    onTranscript,
    onError,
    onAudioLevel,
  } = options;

  const [state, setState] = useState<VoiceInputState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    interimTranscript: '',
    error: null,
    language: language.split('-')[0],
    emotion: null,
    confidence: 0,
    audioLevel: 0,
    recordingDuration: 0,
    silenceDetected: false,
  });

  // Refs
  const isListeningRef = useRef(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSoundTimeRef = useRef<number>(Date.now());
  const startTimeRef = useRef<number>(0);

  // Sync ref with state
  useEffect(() => {
    isListeningRef.current = state.isListening;
  }, [state.isListening]);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setState(s => ({ ...s, isSupported: !!SpeechRecognition }));
  }, []);

  // Audio level analyzer for waveform visualization
  const startAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const analyze = () => {
        if (!isListeningRef.current || !analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalizedLevel = Math.min(100, Math.round((average / 128) * 100));

        setState(s => ({ ...s, audioLevel: normalizedLevel }));
        onAudioLevel?.(normalizedLevel);

        // Silence detection
        if (normalizedLevel > 10) {
          lastSoundTimeRef.current = Date.now();
          setState(s => ({ ...s, silenceDetected: false }));
        } else if (Date.now() - lastSoundTimeRef.current > silenceTimeout) {
          setState(s => ({ ...s, silenceDetected: true }));
        }

        animationFrameRef.current = requestAnimationFrame(analyze);
      };

      analyze();

      return stream;
    } catch (err) {
      console.error('Audio analysis failed:', err);
      return null;
    }
  }, [silenceTimeout, onAudioLevel]);

  // Stop audio analysis
  const stopAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setState(s => ({ ...s, audioLevel: 0 }));
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
      startTimeRef.current = Date.now();
      setState(s => ({ ...s, isListening: true, error: null, recordingDuration: 0 }));
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript;

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

          onTranscript?.(normalized.text, { language: detectedLang, emotion });
        } else {
          interim += result[0].transcript;
        }
      }

      setState(s => ({ ...s, interimTranscript: interim }));
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessages: Record<string, string> = {
        'not-allowed': 'Microphone access denied. Please allow permission.',
        'no-speech': 'No speech detected. Please try again.',
        'audio-capture': 'No microphone found.',
        'network': 'Network error. Check your connection.',
        'aborted': 'Recording stopped.',
      };

      const errorMsg = errorMessages[event.error] || `Error: ${event.error}`;
      isListeningRef.current = false;
      setState(s => ({ ...s, error: errorMsg, isListening: false }));
      onError?.(errorMsg);
      stopAudioAnalysis();
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setState(s => ({ ...s, isListening: false, interimTranscript: '', audioLevel: 0 }));
      stopAudioAnalysis();
    };

    return recognition;
  }, [language, continuous, onTranscript, onError, stopAudioAnalysis]);

  // Clear error
  const clearError = useCallback(() => {
    setState(s => ({ ...s, error: null }));
  }, []);

  // Start listening
  const startListening = useCallback(async () => {
    setState(s => ({ ...s, error: null }));

    // Start audio analysis first (also requests permission)
    const stream = await startAudioAnalysis();
    if (!stream) {
      const errorMsg = 'Microphone access denied.';
      setState(s => ({ ...s, error: errorMsg, isListening: false }));
      onError?.(errorMsg);
      return;
    }

    // Stop previous recognition
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    // Clear timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    // Initialize and start
    recognitionRef.current = initRecognition();
    if (recognitionRef.current) {
      setState(s => ({ ...s, transcript: '', interimTranscript: '', error: null }));

      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
        setState(s => ({ ...s, error: 'Failed to start voice recognition', isListening: false }));
        stopAudioAnalysis();
        return;
      }

      // Duration timer (WhatsApp style)
      durationIntervalRef.current = setInterval(() => {
        setState(s => ({
          ...s,
          recordingDuration: Math.floor((Date.now() - startTimeRef.current) / 1000)
        }));
      }, 1000);

      // Max duration limit
      timeoutRef.current = setTimeout(() => {
        stopListening();
      }, maxDuration);
    }
  }, [initRecognition, onError, startAudioAnalysis, stopAudioAnalysis, maxDuration]);

  // Stop listening (with optional cancel)
  const stopListening = useCallback((cancel = false) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    if (recognitionRef.current) {
      try {
        if (cancel) {
          recognitionRef.current.abort(); // Cancel without firing result
        } else {
          recognitionRef.current.stop();
        }
      } catch {}
    }

    stopAudioAnalysis();
    isListeningRef.current = false;
    setState(s => ({
      ...s,
      isListening: false,
      recordingDuration: 0,
      ...(cancel ? { transcript: '', interimTranscript: '' } : {})
    }));
  }, [stopAudioAnalysis]);

  // Cancel recording (clears transcript)
  const cancelListening = useCallback(() => {
    stopListening(true);
  }, [stopListening]);

  // Toggle listening
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
        try { recognitionRef.current.abort(); } catch {}
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      stopAudioAnalysis();
    };
  }, [stopAudioAnalysis]);

  return {
    ...state,
    startListening,
    stopListening,
    cancelListening,
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
