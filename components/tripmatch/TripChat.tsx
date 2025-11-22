'use client';

/**
 * TripChat Component
 *
 * Real-time group chat for trip members
 * Features: Messages, typing indicators, read receipts, message timestamps
 */

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Smile, MoreVertical } from 'lucide-react';

interface Message {
  id: string;
  tripId: string;
  userId: string;
  message: string;
  messageType: string;
  attachments: string[];
  isSystemMessage: boolean;
  systemEvent?: string;
  readBy: string[];
  createdAt: string;
  profile: {
    displayName: string;
    avatarUrl: string;
    userId: string;
  };
}

interface TripChatProps {
  tripId: string;
}

export default function TripChat({ tripId }: TripChatProps) {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = session?.user?.id;

  useEffect(() => {
    fetchMessages();
    // TODO: Set up real-time listener (Pusher/WebSocket)
    // const channel = pusher.subscribe(`trip-${tripId}`);
    // channel.bind('new-message', (data: Message) => {
    //   setMessages(prev => [...prev, data]);
    // });
  }, [tripId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/tripmatch/trips/${tripId}/messages?limit=50`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const res = await fetch(`/api/tripmatch/trips/${tripId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage.trim(),
          messageType: 'text',
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage('');
      } else {
        alert(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

    return date.toLocaleDateString();
  };

  const isOwnMessage = (message: Message) => {
    return message.userId === currentUserId || message.profile?.userId === currentUserId;
  };

  // Show auth loading state
  if (status === 'loading') {
    return (
      <div className="flex flex-col h-full bg-slate-900 rounded-lg shadow-xl items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        <p className="text-gray-400 mt-2">Loading...</p>
      </div>
    );
  }

  // Require authentication
  if (status === 'unauthenticated' || !session) {
    return (
      <div className="flex flex-col h-full bg-slate-900 rounded-lg shadow-xl items-center justify-center p-6 text-center">
        <p className="text-gray-300 mb-4">Please sign in to access the group chat</p>
        <button
          onClick={() => window.location.href = '/auth/signin'}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div>
          <h3 className="text-lg font-semibold text-white">Group Chat</h3>
          <p className="text-sm text-gray-400">{messages.length} messages</p>
        </div>
        <button className="p-2 hover:bg-slate-800 rounded-lg transition">
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">No messages yet</p>
              <p className="text-sm">Be the first to say hi! 👋</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => {
              const showAvatar = index === 0 || messages[index - 1].userId !== message.userId;
              const isOwn = isOwnMessage(message);

              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  {showAvatar ? (
                    <img
                      src={message.profile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + message.profile?.displayName}
                      alt={message.profile?.displayName}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8" />
                  )}

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {showAvatar && !isOwn && (
                      <span className="text-xs text-gray-400 mb-1 px-3">
                        {message.profile?.displayName}
                      </span>
                    )}

                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isOwn
                          ? 'bg-purple-600 text-white rounded-br-sm'
                          : 'bg-slate-800 text-gray-100 rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm break-words">{message.message}</p>
                    </div>

                    <span className="text-xs text-gray-500 mt-1 px-3">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-slate-700">
        <div className="flex items-end gap-2">
          <button
            type="button"
            className="p-2 hover:bg-slate-800 rounded-lg transition text-gray-400 hover:text-white"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
              placeholder="Type a message..."
              className="w-full bg-slate-800 text-white rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />
            <button
              type="button"
              className="absolute right-2 top-2 p-1 hover:bg-slate-700 rounded-lg transition text-gray-400 hover:text-white"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send • Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}
