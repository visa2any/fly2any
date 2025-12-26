/**
 * useAIStream - Hook for streaming AI chat responses
 *
 * Features:
 * - Real-time token-by-token response display
 * - Automatic fallback to non-streaming if SSE fails
 * - Voice output integration ready
 * - Session context preservation
 */

import { useState, useCallback, useRef } from 'react';
import type { TeamType } from '@/lib/ai/consultant-handoff';

export interface StreamMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface StreamMetadata {
  team?: TeamType;
  consultantName?: string;
  consultantTitle?: string;
  sessionContext?: any;
}

export interface UseAIStreamReturn {
  // State
  isStreaming: boolean;
  currentResponse: string;
  error: string | null;
  metadata: StreamMetadata | null;

  // Actions
  sendMessage: (message: string, options?: SendMessageOptions) => Promise<string>;
  cancelStream: () => void;
  clearResponse: () => void;
}

interface SendMessageOptions {
  conversationHistory?: StreamMessage[];
  sessionToken?: string;
  sessionContext?: any;
  previousTeam?: TeamType;
  customerName?: string;
  onChunk?: (chunk: string, fullText: string) => void;
  onComplete?: (fullText: string, metadata: StreamMetadata) => void;
  onError?: (error: string) => void;
}

export function useAIStream(): UseAIStreamReturn {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<StreamMetadata | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const fullTextRef = useRef('');

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const clearResponse = useCallback(() => {
    setCurrentResponse('');
    fullTextRef.current = '';
    setError(null);
    setMetadata(null);
  }, []);

  const sendMessage = useCallback(async (
    message: string,
    options: SendMessageOptions = {}
  ): Promise<string> => {
    const {
      conversationHistory = [],
      sessionToken,
      sessionContext,
      previousTeam,
      customerName,
      onChunk,
      onComplete,
      onError,
    } = options;

    // Cancel any existing stream
    cancelStream();
    clearResponse();

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsStreaming(true);
    setError(null);
    fullTextRef.current = '';

    try {
      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory,
          sessionToken,
          sessionContext,
          previousTeam,
          customerName,
          streaming: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      // Handle non-streaming fallback responses
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Stream request failed');
      }

      // Check if response is actually SSE
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('text/event-stream')) {
        // Non-streaming response
        const data = await response.json();
        const fullText = data.response || '';
        setCurrentResponse(fullText);
        fullTextRef.current = fullText;
        setMetadata({
          team: data.team,
          consultantName: data.consultantName,
          consultantTitle: data.consultantTitle,
          sessionContext: data.sessionContext,
        });
        onComplete?.(fullText, { ...metadata });
        return fullText;
      }

      // Process SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let streamMetadata: StreamMetadata = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'meta':
                  streamMetadata = {
                    team: data.team,
                    consultantName: data.consultantName,
                    consultantTitle: data.consultantTitle,
                    sessionContext: data.sessionContext,
                  };
                  setMetadata(streamMetadata);
                  break;

                case 'chunk':
                  fullTextRef.current += data.content;
                  setCurrentResponse(fullTextRef.current);
                  onChunk?.(data.content, fullTextRef.current);
                  break;

                case 'done':
                  onComplete?.(fullTextRef.current, streamMetadata);
                  break;

                case 'error':
                  throw new Error(data.message);

                case 'info':
                  // Optional: handle info messages (like "Switching to backup...")
                  break;
              }
            } catch (parseError) {
              // Skip malformed JSON
            }
          }
        }
      }

      return fullTextRef.current;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Stream was cancelled
        return fullTextRef.current;
      }

      const errorMessage = err.message || 'Failed to stream response';
      setError(errorMessage);
      onError?.(errorMessage);

      // Fallback to non-streaming API
      try {
        const fallbackResponse = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            conversationHistory,
            sessionToken,
            sessionContext,
            previousTeam,
            customerName,
            useAI: true,
          }),
        });

        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          const fallbackText = data.response || '';
          setCurrentResponse(fallbackText);
          fullTextRef.current = fallbackText;
          setError(null);
          onComplete?.(fallbackText, {
            team: data.team,
            consultantName: data.consultantName,
          });
          return fallbackText;
        }
      } catch {
        // Fallback also failed
      }

      throw err;
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [cancelStream, clearResponse, metadata]);

  return {
    isStreaming,
    currentResponse,
    error,
    metadata,
    sendMessage,
    cancelStream,
    clearResponse,
  };
}

export default useAIStream;
