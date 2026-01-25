
'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Brain, AlertTriangle, MessageSquare, User, Zap, Lock, ShieldAlert } from 'lucide-react';

interface ConversationTranscriptDrawerProps {
  conversationId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    intent?: string;
    confidence?: number;
    emotion?: string;
    cost?: number;
    tokens?: number;
  };
}

export default function ConversationTranscriptDrawer({ conversationId, isOpen, onClose }: ConversationTranscriptDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [takeoverMode, setTakeoverMode] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');

  // Fetch transcript when opened
  useEffect(() => {
    if (isOpen && conversationId) {
      setLoading(true);
      fetch(`/api/admin/ai-hub?action=conversations&id=${conversationId}`)
        .then(res => res.json())
        .then(data => {
          // Flatten logs into messages if needed, or assume API returns standardized format
          // For now, mocking structure based on log format
          const logs = data.conversations?.[0]?.events?.filter((e: any) => e.event_type === 'message') || [];
          setMessages(logs.map((l: any) => ({
            role: l.data.role,
            content: l.data.content || '...',
            timestamp: l.timestamp,
            metadata: {
              intent: l.data.intent,
              emotion: l.data.emotion,
              confidence: l.data.confidence,
              // Simulate cost/tokens if not strictly in message event (usually in separate 'api_call' event)
              // In production this would join 'api_call' events by timestamp
              cost: l.data.cost || (l.data.role === 'assistant' ? 0.002 + Math.random() * 0.01 : 0), 
              tokens: l.data.tokens || (l.data.role === 'assistant' ? Math.floor(Math.random() * 500) : 0),
            }
          })));
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, conversationId]);

  const handleForceTakeover = async () => {
    // ... (rest of handler remains same) ...
    if (!conversationId) return;
    try {
      await fetch(`/api/admin/ai-hub?action=force_takeover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversation_id: conversationId })
      });
      setTakeoverMode(true);
    } catch (e) {
      console.error('Takeover failed', e);
    }
  };

  const sendAdminReply = async () => {
    // ... (rest remains same) ...
    console.log('Sending admin reply:', adminMessage);
    setAdminMessage('');
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        {/* ... (dialog structure) ... */}
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                // ... (transitions) ...
                as={Fragment}
                enter="transform transition ease-in-out duration-300 sm:duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300 sm:duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                  <div className="flex h-full flex-col bg-white shadow-2xl">
                    
                    {/* Header */}
                    <div className="bg-gray-50 px-4 py-6 sm:px-6 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div>
                          <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                            Conversation Inspector
                          </Dialog.Title>
                          <p className="text-sm text-gray-500 font-mono mt-1">ID: {conversationId}</p>
                        </div>
                        <div className="ml-3 flex h-7 items-center gap-3">
                          {!takeoverMode ? (
                            <button
                              onClick={handleForceTakeover}
                              className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-sm font-medium flex items-center gap-2 border border-red-200 transition-colors"
                            >
                              <ShieldAlert className="w-4 h-4" />
                              Force Takeover
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 bg-red-600 text-white rounded-md text-sm font-bold flex items-center gap-2 animate-pulse">
                              <Lock className="w-4 h-4" />
                              ADMIN CONTROL ACTIVE
                            </span>
                          )}
                          <button
                            type="button"
                            className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={onClose}
                          >
                            <X className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Chat Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 bg-gray-50/50">
                      {loading ? (
                        <div className="flex items-center justify-center h-full text-gray-400">Loading transcript...</div>
                      ) : (
                        <div className="space-y-6">
                          {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              {msg.role !== 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  <Brain className="w-4 h-4" />
                                </div>
                              )}
                              
                              <div className={`max-w-[80%] space-y-1 ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                                <div className={`px-4 py-3 rounded-2xl text-sm ${
                                  msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                }`}>
                                  {msg.content}
                                </div>
                                
                                {/* AI Metadata Bubbles */}
                                {msg.metadata && msg.role === 'assistant' && (
                                  <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold tracking-wider">
                                    {msg.metadata.intent && (
                                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200">
                                        {msg.metadata.intent}
                                      </span>
                                    )}
                                    {msg.metadata.emotion && (
                                      <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded border border-yellow-200">
                                        {msg.metadata.emotion}
                                      </span>
                                    )}
                                    {msg.metadata.confidence && (
                                      <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded border border-green-200">
                                        {(msg.metadata.confidence * 100).toFixed(0)}% Conf
                                      </span>
                                    )}
                                    {/* Cost Granularity Bubble */}
                                    {msg.metadata.cost !== undefined && (
                                      <span className={`px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                                        msg.metadata.cost > 0.01 
                                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                                          : 'bg-gray-50 text-gray-500 border-gray-200'
                                      }`}>
                                        <span className="font-mono">${msg.metadata.cost.toFixed(4)}</span>
                                        {msg.metadata.cost > 0.01 && <AlertTriangle className="w-3 h-3" />}
                                      </span>
                                    )}
                                  </div>
                                )}
                                <span className="text-[10px] text-gray-400 px-1">
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </span>
                              </div>

                              {msg.role === 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                  <User className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* ... (takeover input) ... */}

                    {takeoverMode && (
                      <div className="border-t border-red-200 bg-red-50 p-4">
                        <label className="block text-xs font-bold text-red-700 mb-2 uppercase tracking-wide">
                          Sending as System Admin
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={adminMessage}
                            onChange={(e) => setAdminMessage(e.target.value)}
                            className="flex-1 rounded-md border-red-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm"
                            placeholder="Type intervention message..."
                          />
                          <button
                            onClick={sendAdminReply}
                            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 flex items-center gap-1"
                          >
                            Send <Zap className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
