/**
 * Voice Microphone Button - Level 6+ Ultra-Premium UI
 *
 * Apple-class design with:
 * - Multi-layer pulse animations with spring physics
 * - Glass morphism effects
 * - Sound wave visualization
 * - Premium haptic-like feedback
 * - Full accessibility support
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
  audioLevel?: number;          // 0-100 for waveform
  recordingDuration?: number;   // seconds
  onToggle: () => void;
  onStart?: () => void;         // For hold-to-record
  onStop?: () => void;          // For hold-to-record (sends)
  onCancel?: () => void;        // For swipe-to-cancel
  onStopSpeaking?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'floating';
  holdToRecord?: boolean;       // Enable WhatsApp-style hold
}

export function VoiceMicButton({
  isListening,
  isSupported,
  isSpeaking = false,
  error,
  interimTranscript,
  audioLevel = 0,
  recordingDuration = 0,
  onToggle,
  onStart,
  onStop,
  onCancel,
  onStopSpeaking,
  className,
  size = 'md',
  variant = 'default',
  holdToRecord = false,
}: VoiceMicButtonProps) {
  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const [showPermissionHint, setShowPermissionHint] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [cancelled, setCancelled] = useState(false);
  const startXRef = { current: 0 };

  // WhatsApp-style hold-to-record handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!holdToRecord) return;
    e.preventDefault();
    startXRef.current = e.touches[0].clientX;
    setIsHolding(true);
    setCancelled(false);
    setSwipeOffset(0);
    onStart?.();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isHolding) return;
    const offset = e.touches[0].clientX - startXRef.current;
    setSwipeOffset(Math.min(0, offset)); // Only allow left swipe
    if (offset < -80) {
      setCancelled(true);
    }
  };

  const handleTouchEnd = () => {
    if (!isHolding) return;
    setIsHolding(false);
    if (cancelled) {
      onCancel?.(); // Cancel without sending
    } else {
      onStop?.(); // Stop and send
    }
    setSwipeOffset(0);
    setCancelled(false);
  };

  const handleMouseDown = () => {
    if (!holdToRecord) return;
    setIsHolding(true);
    setCancelled(false);
    onStart?.();
  };

  const handleMouseUp = () => {
    if (!isHolding) return;
    setIsHolding(false);
    onStop?.();
  };

  const sizeClasses = {
    sm: 'h-9 w-9',
    md: 'h-11 w-11',
    lg: 'h-14 w-14',
  };

  const iconSizes = {
    sm: 18,
    md: 22,
    lg: 28,
  };

  const ringScales = {
    sm: ['scale-[1.3]', 'scale-[1.6]', 'scale-[1.9]'],
    md: ['scale-[1.4]', 'scale-[1.8]', 'scale-[2.2]'],
    lg: ['scale-[1.5]', 'scale-[2.0]', 'scale-[2.5]'],
  };

  // Show permission hint on error
  useEffect(() => {
    if (error?.includes('denied')) {
      setShowPermissionHint(true);
    }
  }, [error]);

  // Unsupported browser - show disabled state with tooltip
  if (!isSupported) {
    return (
      <div className="relative inline-flex items-center group">
        <button
          type="button"
          disabled
          className={cn(
            'relative flex items-center justify-center rounded-full',
            'bg-gradient-to-b from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900',
            'border border-neutral-300/50 dark:border-neutral-600/50',
            'opacity-50 cursor-not-allowed',
            'shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.1)]',
            sizeClasses[size]
          )}
        >
          <MicOff size={iconSizes[size]} className="text-neutral-400" />
        </button>
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="px-3 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded-lg whitespace-nowrap shadow-lg">
            Voice not supported in this browser
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100" />
          </div>
        </div>
      </div>
    );
  }

  const variantClasses = {
    default: cn(
      'rounded-full border-2 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
      isListening
        ? 'bg-gradient-to-b from-fly2any-red to-[#C93028] border-fly2any-red/80 text-white shadow-[0_4px_20px_rgba(231,64,53,0.4),0_2px_8px_rgba(231,64,53,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]'
        : error
        ? 'bg-gradient-to-b from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900 border-error/50 text-error'
        : 'bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-800 dark:to-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-fly2any-red/50 hover:text-fly2any-red hover:shadow-[0_2px_12px_rgba(231,64,53,0.15)]'
    ),
    minimal: cn(
      'rounded-xl transition-all duration-200',
      isListening
        ? 'text-fly2any-red bg-fly2any-red/10'
        : 'text-neutral-500 hover:text-fly2any-red hover:bg-fly2any-red/5'
    ),
    floating: cn(
      'rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
      'shadow-[0_4px_12px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)]',
      isListening
        ? 'bg-gradient-to-b from-fly2any-red to-[#C93028] text-white scale-110 shadow-[0_8px_24px_rgba(231,64,53,0.35)]'
        : 'bg-white dark:bg-neutral-800 text-neutral-500 hover:scale-105 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]'
    ),
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      {/* Main Button with Pulse Rings */}
      <div className="relative">
        {/* Animated Pulse Rings - Level 6 multi-layer effect */}
        {isListening && (
          <>
            <span
              className={cn(
                'absolute inset-0 rounded-full bg-fly2any-red/20',
                'animate-[voice-pulse_2s_ease-out_infinite]',
                ringScales[size][0]
              )}
            />
            <span
              className={cn(
                'absolute inset-0 rounded-full bg-fly2any-red/15',
                'animate-[voice-pulse_2s_ease-out_infinite_0.4s]',
                ringScales[size][1]
              )}
            />
            <span
              className={cn(
                'absolute inset-0 rounded-full bg-fly2any-red/10',
                'animate-[voice-pulse_2s_ease-out_infinite_0.8s]',
                ringScales[size][2]
              )}
            />
          </>
        )}

        {/* Button - WhatsApp-style with hold-to-record */}
        <button
          type="button"
          onClick={!holdToRecord ? onToggle : undefined}
          onMouseDown={holdToRecord ? handleMouseDown : () => setIsPressed(true)}
          onMouseUp={holdToRecord ? handleMouseUp : () => setIsPressed(false)}
          onMouseLeave={() => { setIsPressed(false); if (isHolding) handleMouseUp(); }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={cn(
            'relative flex items-center justify-center touch-none select-none',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-fly2any-red/50 focus-visible:ring-offset-2',
            'transition-all duration-100',
            (isPressed || isHolding) && !isListening && 'scale-110',
            isListening && 'scale-105',
            cancelled && 'opacity-50',
            sizeClasses[size],
            variantClasses[variant],
            // Mobile: larger touch target
            'min-w-[44px] min-h-[44px]',
            className
          )}
          style={{ transform: swipeOffset ? `translateX(${swipeOffset}px)` : undefined }}
          aria-label={isListening ? 'Release to send' : holdToRecord ? 'Hold to record' : 'Tap to speak'}
          title={holdToRecord ? 'Hold to record, swipe left to cancel' : 'Tap to speak'}
        >
          {/* Inner Glow when listening */}
          {isListening && (
            <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
          )}

          {/* WhatsApp-style Sound Wave Bars - Real audio level */}
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center gap-0.5 opacity-40">
              {[0, 1, 2, 3, 4].map((i) => {
                // Calculate height based on real audio level with variation
                const baseHeight = Math.max(20, audioLevel * 0.8);
                const variation = Math.sin(Date.now() / 200 + i) * 15;
                const height = Math.min(80, baseHeight + variation);
                return (
                  <span
                    key={i}
                    className="w-0.5 bg-white rounded-full transition-all duration-75"
                    style={{
                      height: `${height}%`,
                      transform: `scaleY(${0.5 + (audioLevel / 200)})`,
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Icon */}
          {isListening ? (
            <Mic size={iconSizes[size]} className="relative z-10 drop-shadow-sm" />
          ) : error ? (
            <MicOff size={iconSizes[size]} className="relative z-10" />
          ) : (
            <Mic size={iconSizes[size]} className="relative z-10" />
          )}
        </button>
      </div>

      {/* TTS Stop Button (when AI is speaking) */}
      {isSpeaking && onStopSpeaking && (
        <button
          type="button"
          onClick={onStopSpeaking}
          className={cn(
            'flex items-center justify-center rounded-full',
            'bg-gradient-to-b from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-900',
            'border border-neutral-200 dark:border-neutral-700',
            'text-neutral-500 hover:text-fly2any-red',
            'transition-all duration-200 hover:scale-105',
            'shadow-[0_1px_3px_rgba(0,0,0,0.08)]',
            sizeClasses[size]
          )}
          aria-label="Stop speaking"
        >
          <VolumeX size={iconSizes[size]} />
        </button>
      )}

      {/* WhatsApp-style Recording Panel - Mobile Optimized */}
      {isListening && (
        <div className={cn(
          'absolute z-20 animate-[fade-in_0.2s_ease-out]',
          // Mobile: Show below button, Desktop: Show to the right
          'max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:top-full max-sm:mt-2',
          'sm:left-full sm:ml-3 sm:top-1/2 sm:-translate-y-1/2'
        )}>
          <div className={cn(
            'flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2',
            'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md',
            'rounded-2xl text-sm',
            'border border-neutral-200/50 dark:border-neutral-700/50',
            'shadow-[0_4px_20px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]',
            cancelled && 'bg-error/10 border-error/30'
          )}>
            {/* Cancel hint on swipe */}
            {holdToRecord && cancelled && (
              <span className="text-error text-xs font-medium animate-pulse">← Cancel</span>
            )}

            {/* Recording indicator dot */}
            {!cancelled && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fly2any-red opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fly2any-red" />
              </span>
            )}

            {/* Timer */}
            <span className={cn(
              'font-mono font-semibold min-w-[40px]',
              cancelled ? 'text-error' : 'text-fly2any-red'
            )}>
              {formatDuration(recordingDuration)}
            </span>

            {/* Waveform visualization - More bars on mobile */}
            <div className="flex items-center gap-0.5 h-5">
              {[...Array(10)].map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'w-[3px] rounded-full transition-all duration-75',
                    cancelled ? 'bg-error/40' : 'bg-fly2any-red/60'
                  )}
                  style={{
                    height: `${Math.max(4, (audioLevel / 100) * 20 + Math.sin(Date.now() / 100 + i * 0.5) * 4)}px`,
                  }}
                />
              ))}
            </div>

            {/* Transcript - Hidden on very small screens */}
            {interimTranscript && !cancelled && (
              <>
                <span className="hidden sm:block w-px h-4 bg-neutral-200 dark:bg-neutral-700" />
                <span className="hidden sm:block max-w-[160px] truncate text-neutral-600 dark:text-neutral-300 text-xs">
                  {interimTranscript}
                </span>
              </>
            )}

            {/* Swipe hint on mobile */}
            {holdToRecord && !cancelled && (
              <span className="sm:hidden text-[10px] text-neutral-400 ml-1">← swipe</span>
            )}
          </div>
        </div>
      )}

      {/* Permission Error Tooltip - Premium design */}
      {showPermissionHint && (
        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 whitespace-nowrap z-30 animate-[fade-in_0.2s_ease-out]">
          <div className={cn(
            'px-4 py-2.5 rounded-xl text-xs font-medium',
            'bg-error/10 border border-error/20 text-error',
            'shadow-[0_4px_12px_rgba(229,72,77,0.15)]',
            'backdrop-blur-sm'
          )}>
            <div className="flex items-center gap-2">
              <MicOff size={14} />
              <span>Please allow microphone access in browser settings</span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-error/20" />
          </div>
        </div>
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes voice-pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
        @keyframes voice-bar {
          0%, 100% {
            transform: scaleY(0.3);
          }
          50% {
            transform: scaleY(1);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Voice Status Indicator - Level 6 Premium
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
    <div className={cn(
      'inline-flex items-center gap-2 px-4 py-1.5',
      'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md',
      'rounded-full text-xs font-medium',
      'border border-neutral-200/50 dark:border-neutral-700/50',
      'shadow-[0_2px_8px_rgba(0,0,0,0.06)]',
      'animate-[fade-in_0.2s_ease-out]'
    )}>
      {isListening && (
        <>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-fly2any-red opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-fly2any-red" />
          </span>
          <span className="text-neutral-600 dark:text-neutral-300">Listening...</span>
        </>
      )}
      {isSpeaking && (
        <>
          <Volume2 size={14} className="text-fly2any-yellow animate-pulse" />
          <span className="text-neutral-600 dark:text-neutral-300">Speaking...</span>
        </>
      )}
      {language && (
        <span className="text-neutral-400 dark:text-neutral-500 uppercase tracking-wide text-[10px]">
          {language}
        </span>
      )}
    </div>
  );
}
