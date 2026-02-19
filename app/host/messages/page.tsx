'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, MessageSquare, Search, Send, User } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCountHost: number;
  guest: { id: string; name: string; image: string | null };
  host: { id: string; name: string; image: string | null };
  property: { id: string; name: string; coverImageUrl: string | null };
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; image: string | null };
}

const POLL_INTERVAL = 15000; // 15 seconds

export default function MessagesPage() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || '';
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showSidebar, setShowSidebar] = useState(true);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/host/messages');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.data || []);
        if (!activeConversationId && data.data?.length > 0) {
          setActiveConversationId(data.data[0].id);
        }
      }
    } catch (e) { console.error(e); }
  }, [activeConversationId]);

  useEffect(() => {
    fetchConversations().then(() => setLoading(false));
  }, [fetchConversations]);

  // Fetch messages when active conversation changes
  const fetchMessages = useCallback(async () => {
    if (!activeConversationId) return;
    try {
      const res = await fetch(`/api/host/messages/${activeConversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.data || []);
      }
    } catch (e) { console.error(e); }
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId) return;
    setLoadingMessages(true);
    fetchMessages().then(() => setLoadingMessages(false));
  }, [activeConversationId, fetchMessages]);

  // Poll for new messages and conversation updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      if (activeConversationId) fetchMessages();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchConversations, fetchMessages, activeConversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    const content = newMessage.trim();
    // Optimistic update
    const optimisticMsg: Message = {
      id: 'temp-' + Date.now(),
      content,
      createdAt: new Date().toISOString(),
      sender: { id: currentUserId || 'me', name: session?.user?.name || 'Me', image: session?.user?.image || null } 
    };
    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');

    try {
      const res = await fetch(`/api/host/messages/${activeConversationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

      if (!res.ok) throw new Error('Failed');
      
      // Refresh to get real message and updated conversation
      fetchMessages();
      fetchConversations();
    } catch {
      alert('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
      setNewMessage(content);
    }
  };

  // Filter conversations by search
  const filteredConversations = searchQuery
    ? conversations.filter(c =>
        c.guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.property?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="h-[calc(100vh-64px)] bg-white flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar List */}
        <div className={cn(
          "w-full md:w-80 lg:w-96 border-r border-neutral-200 flex flex-col h-full bg-neutral-50",
          !showSidebar && "hidden md:flex"
        )}>
            <div className="p-4 border-b border-neutral-200 bg-white">
                <h2 className="text-xl font-bold mb-4">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search guests or properties..."
                      className="w-full pl-9 pr-4 py-2 rounded-lg bg-neutral-100 border-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      {searchQuery ? `No results for "${searchQuery}"` : 'No messages yet.'}
                    </div>
                ) : (
                    filteredConversations.map(conv => (
                        <button 
                            key={conv.id}
                            onClick={() => { setActiveConversationId(conv.id); setShowSidebar(false); }}
                            className={cn(
                                "w-full p-4 flex gap-3 hover:bg-white transition-colors border-b border-neutral-100 text-left",
                                activeConversationId === conv.id ? "bg-white border-l-4 border-l-primary-600 shadow-sm" : "border-l-4 border-l-transparent"
                            )}
                        >
                            <div className="relative">
                                {conv.guest.image ? (
                                    <Image src={conv.guest.image} alt={conv.guest.name} width={40} height={40} className="rounded-full object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center"><User className="w-5 h-5 text-gray-400" /></div>
                                )}
                                {conv.unreadCountHost > 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white"></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className={cn("font-bold text-sm truncate", conv.unreadCountHost > 0 ? "text-gray-900" : "text-gray-700")}>{conv.guest.name}</span>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{format(new Date(conv.lastMessageAt), 'MMM d')}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate font-medium">{conv.property?.name}</p>
                                <p className={cn("text-sm truncate mt-1", conv.unreadCountHost > 0 ? "text-gray-900 font-semibold" : "text-gray-600")}>{conv.lastMessage}</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>

        {/* Chat Window */}
        <div className={cn("flex-1 flex flex-col h-full bg-white", showSidebar && "hidden md:flex")}>
            {activeConversationId && activeConversation ? (
                <>
                    <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             {/* Mobile back button */}
                             <button onClick={() => setShowSidebar(true)} className="md:hidden p-1 -ml-1 text-gray-500 hover:text-gray-900">
                               ←
                             </button>
                             <h3 className="font-bold text-gray-900">
                                 {activeConversation.guest.name}
                             </h3>
                             <span className="text-xs text-gray-400">• {activeConversation.property?.name}</span>
                         </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                         {loadingMessages ? (
                             <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-300" /></div>
                         ) : messages.length === 0 ? (
                             <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-sm">No messages in this conversation yet.</p>
                             </div>
                         ) : (
                             messages.map(msg => {
                                 const isMe = msg.sender.id === currentUserId || msg.sender.id === 'me';
                                 return (
                                     <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                         <div className={cn(
                                             "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                                             isMe ? "bg-primary-600 text-white rounded-br-none" : "bg-neutral-100 text-gray-800 rounded-bl-none"
                                         )}>
                                             {msg.content}
                                             <div className={cn("text-[10px] mt-1 opacity-70", isMe ? "text-right" : "text-left")}>
                                                {format(new Date(msg.createdAt), 'h:mm a')}
                                             </div>
                                         </div>
                                     </div>
                                 );
                             })
                         )}
                         <div ref={messagesEndRef} />
                    </div>

                    {/* AI Quick Response Suggestions */}
                    <div className="px-4 py-2 border-t border-neutral-50 bg-neutral-50/50">
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0">Quick:</span>
                        {[
                          { label: '🔑 Check-in Info', text: 'Hi! Check-in is from 3:00 PM. I\'ll send you the access code the day before your arrival. Let me know if you need anything!' },
                          { label: '👋 Welcome', text: 'Welcome! I hope you have a wonderful stay. Don\'t hesitate to reach out if you need any recommendations or assistance.' },
                          { label: '🙏 Thank You', text: 'Thank you for your message! I\'ll get back to you shortly with all the details.' },
                          { label: '📍 Directions', text: 'The property is easy to find! I\'ll send you detailed directions with landmarks closer to your check-in date.' },
                        ].map((suggestion) => (
                          <button
                            key={suggestion.label}
                            type="button"
                            onClick={() => setNewMessage(suggestion.text)}
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-medium text-gray-600 hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-all"
                          >
                            {suggestion.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 border-t border-neutral-100 bg-white">
                        <div className="relative flex items-center gap-2">
                            <input 
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                type="text" 
                                placeholder="Type a message..." 
                                className="flex-1 bg-neutral-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500" 
                            />
                            <button 
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                    <p>Select a conversation to start messaging</p>
                </div>
            )}
        </div>
    </div>
  );
}
