'use client';

import { useState, useEffect } from 'react';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { Loader2, MessageSquare, Search, Send, User } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { cn } from '@/lib/utils'; // Assuming cn exists

interface Conversation {
  id: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCountHost: number;
  guest: { id: string; name: string; image: string | null };
  property: { id: string; name: string; coverImageUrl: string | null };
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; image: string | null };
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Fetch conversations
  useEffect(() => {
    async function fetchConvos() {
      try {
        const res = await fetch('/api/host/messages');
        if (res.ok) {
            const data = await res.json();
            setConversations(data.data || []);
            if (data.data?.length > 0) setActiveConversationId(data.data[0].id);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchConvos();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) return;
    async function fetchMessages() {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/host/messages/${activeConversationId}`);
        if (res.ok) {
            const data = await res.json();
            setMessages(data.data || []);
        }
      } catch (e) { console.error(e); }
      setLoadingMessages(false);
    }
    fetchMessages();
  }, [activeConversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId) return;

    try {
        // Optimistic update
        const optimisticMsg: Message = {
            id: 'temp-' + Date.now(),
            content: newMessage,
            createdAt: new Date().toISOString(),
            sender: { id: 'me', name: 'Me', image: null } 
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');

        const res = await fetch(`/api/host/messages/${activeConversationId}`, {
            method: 'POST',
            body: JSON.stringify({ content: optimisticMsg.content })
        });

        if (!res.ok) throw new Error("Failed");
        
        // Refresh to get real ID and server state if needed, or just let it be
    } catch (e) {
        alert("Failed to send message");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="h-[calc(100vh-64px)] bg-white flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar List */}
        <div className="w-full md:w-80 lg:w-96 border-r border-neutral-200 flex flex-col h-full bg-neutral-50">
            <div className="p-4 border-b border-neutral-200 bg-white">
                <h2 className="text-xl font-bold mb-4">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Search guests..." className="w-full pl-9 pr-4 py-2 rounded-lg bg-neutral-100 border-none focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">No messages yet.</div>
                ) : (
                    conversations.map(conv => (
                        <button 
                            key={conv.id}
                            onClick={() => setActiveConversationId(conv.id)}
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
                                    <span className="font-bold text-sm text-gray-900 truncate">{conv.guest.name}</span>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{format(new Date(conv.lastMessageAt), 'MMM d')}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate font-medium">{conv.property?.name}</p>
                                <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage}</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col h-full bg-white">
            {activeConversationId ? (
                <>
                    <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                         <div className="flex items-center gap-3">
                             {/* Guest Info Header */}
                             <h3 className="font-bold text-gray-900">
                                 {conversations.find(c => c.id === activeConversationId)?.guest.name}
                             </h3>
                         </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                         {loadingMessages ? (
                             <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-300" /></div>
                         ) : (
                             messages.map(msg => {
                                 const isMe = msg.sender.id === 'me' || conversations.find(c => c.id === activeConversationId)?.guest.id !== msg.sender.id; // Rough sender check logic
                                 // Ideally we check session.user.id but for quick UI we assume if senderId != guestId its me
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
