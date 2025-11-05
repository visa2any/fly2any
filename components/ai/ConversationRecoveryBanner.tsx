'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, X, Clock, MessageCircle } from 'lucide-react';
import { ConversationState, getConversationAge } from '@/lib/ai/conversation-persistence';

interface ConversationRecoveryBannerProps {
  conversation: ConversationState;
  onResume: () => void;
  onStartNew: () => void;
  onDismiss: () => void;
}

export function ConversationRecoveryBanner({
  conversation,
  onResume,
  onStartNew,
  onDismiss
}: ConversationRecoveryBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const age = getConversationAge(conversation);

  useEffect(() => {
    // Auto-dismiss after 30 seconds if no action taken
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 30000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!isVisible) return null;

  const formatAge = (minutes: number): string => {
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getConsultantName = () => {
    const lastAssistantMessage = [...conversation.messages]
      .reverse()
      .find(m => m.role === 'assistant');
    return lastAssistantMessage?.consultant?.name || 'our travel specialist';
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slideDown">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left side: Icon + Message */}
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <RefreshCw className="w-6 h-6" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg">
                  👋 Welcome back!
                </p>
                <p className="text-sm text-blue-100 mt-0.5">
                  You have an active conversation with <span className="font-medium">{getConsultantName()}</span> from {formatAge(age)}
                </p>

                {/* Conversation preview */}
                <div className="mt-2 flex items-center gap-2 text-xs text-blue-100">
                  <MessageCircle className="w-3 h-3" />
                  <span>{conversation.messages.length} messages</span>
                  <Clock className="w-3 h-3 ml-2" />
                  <span>Started {formatAge(Math.floor((Date.now() - conversation.metadata.startedAt) / 60000))}</span>
                </div>
              </div>
            </div>

            {/* Right side: Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  setIsVisible(false);
                  onResume();
                }}
                className="px-4 py-2 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Resume</span>
              </button>

              <button
                onClick={() => {
                  setIsVisible(false);
                  onStartNew();
                }}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 font-medium rounded-lg transition-colors"
              >
                Start New
              </button>

              <button
                onClick={() => {
                  setIsVisible(false);
                  onDismiss();
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for mobile
 */
export function ConversationRecoveryBannerCompact({
  conversation,
  onResume,
  onStartNew,
  onDismiss
}: ConversationRecoveryBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const age = getConversationAge(conversation);

  if (!isVisible) return null;

  const formatAge = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slideDown md:hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <RefreshCw className="w-5 h-5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  Continue chat from {formatAge(age)}
                </p>
                <p className="text-xs text-blue-100">
                  {conversation.messages.length} messages
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => {
                  setIsVisible(false);
                  onResume();
                }}
                className="px-3 py-1.5 bg-white text-blue-600 text-sm font-medium rounded-md"
              >
                Resume
              </button>
              <button
                onClick={() => {
                  setIsVisible(false);
                  onDismiss();
                }}
                className="p-1.5 hover:bg-white/20 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
