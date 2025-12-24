/**
 * Voice Microphone Button - Premium UI Component
 *
 * Apple-class design with:
 * - Pulse animation when listening
 * - Visual feedback states
 * - Accessibility support
 */

'use client';

import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceMicButtonProps {
  isListening: boolean;
  isSupported: boolean;
  isSpeaking?: boolean;
  error?: string | null;
  interimTranscript?: string;
  onToggle: () => void;
  onStopSpeaking?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'floating';
}

export function VoiceMicButton({
  isListening,
  isSupported,
  isSpeaking = false,
  error,
  interimTranscript,
  onToggle,
  onStopSpeaking,
  className,
  size = 'md',
  variant = 'default',
}: VoiceMicButtonProps) {
  const [showPermissionHint, setShowPermissionHint] = useState(false);

  // Show permission hint on first use
  useEffect(() => {
    if (error?.includes('denied')) {
      setShowPermissionHint(true);
    }
  }, [error]);

  if (!isSupported) {
    return null; // Hide if browser doesn't support
  }

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const variantClasses = {
    default: cn(
      'rounded-full border transition-all duration-200',
      isListening
        ? 'bg-fly2any-red border-fly2any-red text-white shadow-lg shadow-fly2any-red/30'
        : 'bg-white dark:bg-layer-1-dark border-layer-2 dark:border-layer-2-dark text-text-secondary hover:text-fly2any-red hover:border-fly2any-red'
    ),
    minimal: cn(
      'rounded-lg transition-colors duration-150',
      isListening
        ? 'text-fly2any-red'
        : 'text-text-secondary hover:text-fly2any-red'
    ),
    floating: cn(
      'rounded-full shadow-lg transition-all duration-300',
      isListening
        ? 'bg-fly2any-red text-white scale-110 shadow-fly2any-red/40'
        : 'bg-white dark:bg-layer-1-dark text-text-secondary hover:scale-105'
    ),
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      {/* Main Button */}
      <button
        type="button"
        onClick={onToggle}
        disabled={!!error && error.includes('denied')}
        className={cn(
          'relative flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-fly2any-red/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        title={isListening ? 'Click to stop' : 'Click to speak'}
      >
        {/* Pulse animation when listening */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-fly2any-red animate-ping opacity-30" />
            <span className="absolute inset-0 rounded-full bg-fly2any-red animate-pulse opacity-20" />
          </>
        )}

        {/* Icon */}
        {isListening ? (
          <Mic size={iconSizes[size]} className="relative z-10 animate-pulse" />
        ) : error ? (
          <MicOff size={iconSizes[size]} className="relative z-10" />
        ) : (
          <Mic size={iconSizes[size]} className="relative z-10" />
        )}
      </button>

      {/* TTS Stop Button (when speaking) */}
      {isSpeaking && onStopSpeaking && (
        <button
          type="button"
          onClick={onStopSpeaking}
          className={cn(
            'flex items-center justify-center rounded-full transition-colors',
            sizeClasses[size],
            'bg-layer-1 dark:bg-layer-2-dark text-text-secondary hover:text-fly2any-red'
          )}
          aria-label="Stop speaking"
        >
          <VolumeX size={iconSizes[size]} />
        </button>
      )}

      {/* Interim Transcript (live feedback) */}
      {isListening && interimTranscript && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-layer-1 dark:bg-layer-2-dark rounded-full text-sm text-text-secondary border border-layer-2 dark:border-layer-2-dark shadow-sm">
            <Loader2 size={14} className="animate-spin text-fly2any-red" />
            <span className="max-w-[200px] truncate">{interimTranscript}</span>
          </div>
        </div>
      )}

      {/* Error/Permission Hint */}
      {showPermissionHint && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className="px-3 py-2 bg-error/10 border border-error/20 rounded-lg text-xs text-error">
            Please allow microphone access in your browser settings
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Voice Status Indicator - Shows current voice state
 */
export function VoiceStatusIndicator({
  isListening,
  isSpeaking,
  language,
}: {
  isListening: boolean;
  isSpeaking: boolean;
  language?: string;
}) {
  if (!isListening && !isSpeaking) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-layer-1 dark:bg-layer-2-dark rounded-full text-xs">
      {isListening && (
        <>
          <span className="w-2 h-2 rounded-full bg-fly2any-red animate-pulse" />
          <span className="text-text-secondary">Listening...</span>
        </>
      )}
      {isSpeaking && (
        <>
          <Volume2 size={14} className="text-fly2any-yellow animate-pulse" />
          <span className="text-text-secondary">Speaking...</span>
        </>
      )}
      {language && (
        <span className="text-text-placeholder uppercase">{language}</span>
      )}
    </div>
  );
}
