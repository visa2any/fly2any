'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';

// Mobile UX optimization types
export interface MobileFormConfig {
  oneHandedMode: boolean;
  swipeGestures: boolean;
  hapticFeedback: boolean;
  biometricAuth: boolean;
  progressiveDisclosure: boolean;
  smartKeyboard: boolean;
  gestureNavigation: boolean;
}

export interface TouchInteraction {
  type: 'tap' | 'swipe' | 'pinch' | 'drag';
  duration: number;
  accuracy: number;
  pressure?: number;
}

export interface MobileFormField {
  id: string;
  label: string;
  type: string;
  value: any;
  mobileOptimizations: {
    keyboardType?: 'default' | 'numeric' | 'email' | 'tel' | 'url';
    inputMode?: 'text' | 'numeric' | 'tel' | 'email' | 'search';
    autoComplete?: string;
    pattern?: string;
    minTouchTarget?: number; // in pixels
    swipeActions?: { left?: string; right?: string };
  };
}

interface MobileOptimizedFormUXProps {
  fields: MobileFormField[];
  config: MobileFormConfig;
  onFieldChange: (fieldId: string, value: any) => void;
  onFormSubmit: (data: Record<string, any>) => Promise<void>;
  className?: string;
}

// One-handed operation hook
export const useOneHandedMode = (enabled: boolean) => {
  const [isOneHanded, setIsOneHanded] = useState(enabled);
  const [thumbReachArea, setThumbReachArea] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const calculateThumbReach = () => {
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      
      // Typical thumb reach area (bottom 2/3 of screen, right side for right-handed users)
      const reachHeight = screenHeight * 0.67;
      const reachWidth = screenWidth * 0.75;
      
      setThumbReachArea({
        x: screenWidth - reachWidth,
        y: screenHeight - reachHeight,
        width: reachWidth,
        height: reachHeight,
        top: screenHeight - reachHeight,
        right: screenWidth,
        bottom: screenHeight,
        left: screenWidth - reachWidth,
        toJSON: () => ({})
      });
    };

    calculateThumbReach();
    window.addEventListener('resize', calculateThumbReach);
    window.addEventListener('orientationchange', calculateThumbReach);

    return () => {
      window.removeEventListener('resize', calculateThumbReach);
      window.removeEventListener('orientationchange', calculateThumbReach);
    };
  }, [enabled]);

  const isInThumbReach = useCallback((element: HTMLElement) => {
    if (!thumbReachArea || !isOneHanded) return true;

    const rect = element.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const centerX = rect.left + rect.width / 2;

    return centerY >= thumbReachArea.top && centerX >= thumbReachArea.left;
  }, [thumbReachArea, isOneHanded]);

  return { isOneHanded, setIsOneHanded, thumbReachArea, isInThumbReach };
};

// Haptic feedback hook
export const useHapticFeedback = (enabled: boolean) => {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if (!enabled || !navigator.vibrate) return;
    navigator.vibrate(pattern);
  }, [enabled]);

  const feedbackPatterns = useMemo(() => ({
    success: [50, 50, 50],
    error: [100, 50, 100, 50, 100],
    warning: [50, 100, 50],
    tap: 10,
    swipe: [20, 10, 20],
    longPress: 50
  }), []);

  const triggerFeedback = useCallback((type: keyof typeof feedbackPatterns) => {
    vibrate(feedbackPatterns[type]);
  }, [vibrate, feedbackPatterns]);

  return { triggerFeedback, vibrate };
};

// Smart keyboard hook
export const useSmartKeyboard = (fieldType: string, currentValue: string) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const handleViewportChange = () => {
      const initialHeight = window.innerHeight;
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDiff = initialHeight - currentHeight;
      
      if (heightDiff > 150) { // Likely keyboard is open
        setKeyboardHeight(heightDiff);
        setIsKeyboardVisible(true);
      } else {
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => window.visualViewport?.removeEventListener('resize', handleViewportChange);
    }
  }, []);

  const getOptimalKeyboard = useCallback((fieldType: string) => {
    const keyboardConfigs = {
      email: { inputMode: 'email' as const, keyboardType: 'email' as const },
      tel: { inputMode: 'tel' as const, keyboardType: 'tel' as const },
      number: { inputMode: 'numeric' as const, keyboardType: 'numeric' as const },
      url: { inputMode: 'url' as const, keyboardType: 'url' as const },
      search: { inputMode: 'search' as const, keyboardType: 'default' as const },
      default: { inputMode: 'text' as const, keyboardType: 'default' as const }
    };

    return keyboardConfigs[fieldType as keyof typeof keyboardConfigs] || keyboardConfigs.default;
  }, []);

  return { 
    keyboardHeight, 
    isKeyboardVisible, 
    getOptimalKeyboard: () => getOptimalKeyboard(fieldType) 
  };
};

// Swipe gesture hook
export const useSwipeGestures = (enabled: boolean) => {
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!enabled) return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, [enabled]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!enabled || !touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Ensure it's a horizontal swipe (not vertical scroll)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50 && deltaTime < 300) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
      
      // Clear direction after animation
      setTimeout(() => setSwipeDirection(null), 300);
    }
    
    touchStartRef.current = null;
  }, [enabled]);

  return { swipeDirection, handleTouchStart, handleTouchEnd };
};

// Biometric authentication hook
export const useBiometricAuth = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Check for biometric authentication support
    const checkBiometricSupport = async () => {
      if ('credentials' in navigator && 'create' in navigator.credentials) {
        try {
          // Check if WebAuthn is supported
          const isWebAuthnSupported = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setIsSupported(isWebAuthnSupported);
          setIsAvailable(isWebAuthnSupported);
        } catch (error) {
          console.log('Biometric authentication not supported:', error);
          setIsSupported(false);
          setIsAvailable(false);
        }
      }
    };

    checkBiometricSupport();
  }, []);

  const authenticateWithBiometric = useCallback(async () => {
    if (!isAvailable) return false;

    try {
      // Simplified biometric authentication
      // In a real implementation, you'd use WebAuthn API
      const result = await new Promise((resolve) => {
        // Simulate biometric prompt
        setTimeout(() => resolve(true), 1000);
      });

      return result;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }, [isAvailable]);

  return { isSupported, isAvailable, authenticateWithBiometric };
};

// Progress indicator with emotional design
export const ProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  completionRate 
}: { 
  currentStep: number; 
  totalSteps: number; 
  completionRate: number;
}) => {
  const getEmoji = (progress: number) => {
    if (progress < 25) return '🚀';
    if (progress < 50) return '✈️';
    if (progress < 75) return '🌟';
    return '🎉';
  };

  const getMotivationalText = (progress: number) => {
    if (progress < 25) return 'Vamos começar esta jornada!';
    if (progress < 50) return 'Você está indo bem!';
    if (progress < 75) return 'Quase lá! Continue assim!';
    return 'Parabéns! Quase terminando!';
  };

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getEmoji(completionRate)}</span>
          <span className="font-medium text-gray-700">
            {getMotivationalText(completionRate)}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          {currentStep}/{totalSteps}
        </span>
      </div>
      
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${completionRate}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
          </div>
        </div>
        
        {/* Celebration particles for completed sections */}
        {completionRate > 75 && (
          <div className="absolute -top-2 right-0 text-yellow-400 animate-bounce">
            ✨
          </div>
        )}
      </div>
    </div>
  );
};

export default function MobileOptimizedFormUX({
  fields,
  config,
  onFieldChange,
  onFormSubmit,
  className = ''
}: MobileOptimizedFormUXProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { isOneHanded, setIsOneHanded, thumbReachArea, isInThumbReach } = useOneHandedMode(config.oneHandedMode);
  const { triggerFeedback } = useHapticFeedback(config.hapticFeedback);
  const { swipeDirection, handleTouchStart, handleTouchEnd } = useSwipeGestures(config.swipeGestures);
  const { isSupported: biometricSupported, authenticateWithBiometric } = useBiometricAuth();

  // Calculate completion progress
  const completionRate = useMemo(() => {
    const totalFields = fields.length;
    const filledFields = Object.keys(formData).filter(key => formData[key]).length;
    return totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
  }, [formData, fields.length]);

  // Handle field changes with haptic feedback
  const handleFieldChange = useCallback((fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    onFieldChange(fieldId, value);
    
    // Trigger success haptic feedback
    if (value && !errors[fieldId]) {
      triggerFeedback('success');
    }
  }, [onFieldChange, triggerFeedback, errors]);

  // Progressive disclosure: show fields based on previous completions
  const visibleFields = useMemo(() => {
    if (!config.progressiveDisclosure) return fields;
    
    const completedFields = Object.keys(formData).filter(key => formData[key]).length;
    return fields.slice(0, Math.min(completedFields + 2, fields.length));
  }, [fields, formData, config.progressiveDisclosure]);

  // Handle form submission with biometric auth if available
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (config.biometricAuth && biometricSupported) {
      const biometricSuccess = await authenticateWithBiometric();
      if (!biometricSuccess) {
        triggerFeedback('error');
        return;
      }
    }
    
    triggerFeedback('success');
    await onFormSubmit(formData);
  };

  // Swipe navigation between steps
  useEffect(() => {
    if (swipeDirection === 'left' && currentStep < fields.length - 1) {
      setCurrentStep(prev => prev + 1);
      triggerFeedback('swipe');
    } else if (swipeDirection === 'right' && currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      triggerFeedback('swipe');
    }
  }, [swipeDirection, currentStep, fields.length, triggerFeedback]);

  return (
    <div 
      className={`mobile-optimized-form ${className} ${isOneHanded ? 'one-handed-mode' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress indicator */}
      <ProgressIndicator 
        currentStep={visibleFields.length}
        totalSteps={fields.length}
        completionRate={completionRate}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        {visibleFields.map((field, index) => (
          <MobileFormField
            key={field.id}
            field={field}
            value={formData[field.id] || ''}
            onChange={(value) => handleFieldChange(field.id, value)}
            error={errors[field.id]}
            isInThumbReach={isInThumbReach}
            config={config}
            triggerFeedback={triggerFeedback}
          />
        ))}

        {/* Smart CTA positioning based on thumb reach */}
        <div className={`sticky bottom-4 z-10 ${isOneHanded ? 'one-handed-cta' : ''}`}>
          <button
            type="submit"
            disabled={completionRate < 100}
            onClick={() => triggerFeedback('tap')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 
                     rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transform transition-all duration-200 active:scale-95
                     min-h-[56px] touch-manipulation"
            style={{ minHeight: '44px' }} // iOS minimum touch target
          >
            {completionRate === 100 ? (
              <span className="flex items-center justify-center space-x-2">
                <span>Buscar Voos Agora</span>
                <span className="text-2xl">🚀</span>
              </span>
            ) : (
              <span>Complete o formulário ({Math.round(completionRate)}%)</span>
            )}
          </button>

          {/* Biometric auth indicator */}
          {config.biometricAuth && biometricSupported && (
            <div className="flex items-center justify-center mt-2 text-sm text-gray-600">
              <span>🔒 Protegido com autenticação biométrica</span>
            </div>
          )}
        </div>
      </form>

      {/* One-handed mode toggle */}
      {config.oneHandedMode && (
        <button
          onClick={() => setIsOneHanded(!isOneHanded)}
          className="fixed top-20 right-4 bg-black bg-opacity-20 text-white p-2 rounded-full z-50"
        >
          <span className="text-xl">{isOneHanded ? '👆' : '👍'}</span>
        </button>
      )}

      {/* Swipe hint */}
      {config.swipeGestures && (
        <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 
                      flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm">
          <span>←</span>
          <span>Deslize para navegar</span>
          <span>→</span>
        </div>
      )}
    </div>
  );
}

// Individual mobile-optimized form field
function MobileFormField({
  field,
  value,
  onChange,
  error,
  isInThumbReach,
  config,
  triggerFeedback
}: {
  field: MobileFormField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  isInThumbReach: (element: HTMLElement) => boolean;
  config: MobileFormConfig;
  triggerFeedback: (type: "error" | "warning" | "success" | "tap" | "swipe" | "longPress") => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { keyboardHeight, isKeyboardVisible, getOptimalKeyboard } = useSmartKeyboard(field.type, value);
  
  const keyboardConfig = getOptimalKeyboard();
  const [isFocused, setIsFocused] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(0);

  // Handle touch interactions with haptic feedback
  const handleTouchStart = () => {
    setTouchStartTime(Date.now());
    triggerFeedback('tap');
  };

  const handleTouchEnd = () => {
    const touchDuration = Date.now() - touchStartTime;
    if (touchDuration > 500) {
      triggerFeedback('longPress');
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    triggerFeedback('tap');
    
    // Auto-scroll to keep field visible when keyboard opens
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    if (e.target.value) {
      triggerFeedback('success');
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {field.label}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type={field.type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          inputMode={keyboardConfig.inputMode}
          autoComplete={field.mobileOptimizations.autoComplete}
          pattern={field.mobileOptimizations.pattern}
          className={`w-full px-4 py-4 border-2 rounded-lg transition-all duration-200 
                     text-lg touch-manipulation
                     ${error ? 'border-red-500 bg-red-50' : 
                       isFocused ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-100' : 
                       'border-gray-200 bg-white'}
                     ${!isInThumbReach(inputRef.current!) ? 'thumb-reach-warning' : ''}`}
          style={{ 
            minHeight: Math.max(field.mobileOptimizations.minTouchTarget || 44, 44),
            fontSize: '16px' // Prevent zoom on iOS
          }}
        />

        {/* Field validation indicator */}
        {value && !error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Error message with haptic feedback */}
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center space-x-1">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Swipe actions hint */}
      {field.mobileOptimizations.swipeActions && config.swipeGestures && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
          <div className="flex items-center space-x-1">
            {field.mobileOptimizations.swipeActions.left && (
              <span>← {field.mobileOptimizations.swipeActions.left}</span>
            )}
            {field.mobileOptimizations.swipeActions.right && (
              <span>{field.mobileOptimizations.swipeActions.right} →</span>
            )}
          </div>
        </div>
      )}

      {/* Keyboard adjustment spacer */}
      {isKeyboardVisible && keyboardHeight > 0 && isFocused && (
        <div style={{ height: `${keyboardHeight / 2}px` }} />
      )}
    </div>
  );
}