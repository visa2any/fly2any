'use client';

import { AlertCircle, Heart, Zap, HelpCircle, Sparkles, CheckCircle, MessageCircle } from 'lucide-react';
import type { EmotionalState } from '@/lib/ai/emotion-detection';
import { getEmotionVisualIndicator } from '@/lib/ai/emotion-detection';

interface EmotionalIndicatorProps {
  emotion: EmotionalState;
  confidence: number;
  urgency: 'low' | 'medium' | 'high';
  compact?: boolean;
}

/**
 * Visual indicator for detected emotional state
 * Shows subtle cues to the user that their emotions are understood
 */
export function EmotionalIndicator({
  emotion,
  confidence,
  urgency,
  compact = false,
}: EmotionalIndicatorProps) {
  const visual = getEmotionVisualIndicator(emotion);

  // Get appropriate icon for emotion
  const getEmotionIcon = () => {
    switch (emotion) {
      case 'urgent':
        return <Zap className="w-3.5 h-3.5" />;
      case 'frustrated':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'worried':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'confused':
        return <HelpCircle className="w-3.5 h-3.5" />;
      case 'excited':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'satisfied':
        return <CheckCircle className="w-3.5 h-3.5" />;
      case 'casual':
        return <MessageCircle className="w-3.5 h-3.5" />;
      default:
        return <Heart className="w-3.5 h-3.5" />;
    }
  };

  const getEmotionLabel = () => {
    switch (emotion) {
      case 'urgent':
        return 'Priority Support';
      case 'frustrated':
        return 'Empathy Mode';
      case 'worried':
        return 'Reassurance Mode';
      case 'confused':
        return 'Explain Mode';
      case 'excited':
        return 'Enthusiasm Match';
      case 'satisfied':
        return 'Happy to Help';
      case 'casual':
        return 'Casual Chat';
      default:
        return 'Professional Mode';
    }
  };

  // Don't show indicator for neutral or low confidence
  if (emotion === 'neutral' || confidence < 0.6) {
    return null;
  }

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${visual.bgColor} ${visual.color} ${visual.borderColor} border ${
          visual.pulseAnimation ? 'animate-pulse' : ''
        }`}
      >
        <span className={visual.iconColor}>{getEmotionIcon()}</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${visual.bgColor} ${visual.color} ${visual.borderColor} border ${
        visual.pulseAnimation ? 'animate-pulse' : ''
      }`}
    >
      <span className={visual.iconColor}>{getEmotionIcon()}</span>
      <span>{getEmotionLabel()}</span>
    </div>
  );
}
