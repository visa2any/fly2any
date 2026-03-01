'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, MessageSquare, Search, Send, User, Sparkles, Info, X, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

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
  const [showContextDrawer, setShowContextDrawer] = useState(false);

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

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Poll for new messages and conversation updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      if (activeConversationId) fetchMessages();
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchConversations, fetchMessages, activeConversationId]);

  const handleGenerateAIReply = async () => {
      if (!activeConversationId || messages.length === 0) return;
      setIsGeneratingAI(true);
      
      try {
          // Send the last few messages for context
          const contextMessages = messages.slice(-5).map(m => ({
              role: m.sender.id === currentUserId || m.sender.id === 'me' ? 'assistant' : 'user',
              content: m.content
          }));

          const res = await fetch('/api/ai/co-host-reply', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  conversationId: activeConversationId,
                  messages: contextMessages
              })
          });

          const data = await res.json();
          if (data.success) {
              setNewMessage(data.reply);
          } else {
              throw new Error(data.error);
          }
      } catch (e: any) {
          toast.error("Failed to generate AI reply: " + e.message);
      } finally {
          setIsGeneratingAI(false);
      }
  }

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
      toast.error('Failed to send message');
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
          "w-full md:w-80 lg:w-96 border-r border-neutral-100 flex flex-col h-full bg-[#FDFDFD]",
          !showSidebar && "hidden md:flex"
        )}>
            <div className="p-6 border-b border-neutral-100 bg-white">
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active Node</span>
                </div>
                <h2 className="text-2xl font-black text-[#0A0A0A] tracking-tighter mb-5">Command Center</h2>
                
                {/* Smart Timeline (High Fidelity) */}
                <div className="mb-6 p-4 bg-[#F8FAFC] rounded-2xl border border-neutral-100 divide-y divide-neutral-100">
                    <div className="pb-3 flex items-center justify-between">
                       <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Smart Timeline</span>
                       <Clock className="w-3.5 h-3.5 text-neutral-300" />
                    </div>
                    <div className="py-3">
                       <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">Today, Oct 24</p>
                       <div className="flex items-center justify-between text-xs font-bold text-[#0A0A0A]">
                          <span>Penthouse Suite</span>
                          <span className="text-neutral-400">3:00 PM</span>
                       </div>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search command center..."
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-primary-400 shadow-sm focus:shadow-soft-lg transition-all text-sm font-semibold text-[#0A0A0A]"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-neutral-400 text-xs font-black uppercase tracking-widest">
                      {searchQuery ? `No results for "${searchQuery}"` : 'Inbox Empty'}
                    </div>
                ) : (
                    filteredConversations.map(conv => (
                        <button 
                            key={conv.id}
                            onClick={() => { setActiveConversationId(conv.id); setShowSidebar(false); }}
                            className={cn(
                                "w-full p-5 flex gap-5 transition-all text-left rounded-[1.5rem] group border border-transparent mb-1",
                                activeConversationId === conv.id 
                                    ? "bg-white shadow-soft-lg border-neutral-100 scale-[1.02] z-10 relative" 
                                    : "hover:bg-neutral-100/50"
                            )}
                        >
                            <div className="relative shrink-0">
                                {conv.guest.image ? (
                                    <Image src={conv.guest.image} alt={conv.guest.name} width={48} height={48} className="rounded-full object-cover shadow-sm border border-white" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100"><User className="w-6 h-6 text-indigo-400" /></div>
                                )}
                                {conv.unreadCountHost > 0 && <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full ring-4 ring-white shadow-sm border border-white"></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className={cn("font-black text-sm truncate tracking-tight", conv.unreadCountHost > 0 ? "text-[#0A0A0A]" : "text-neutral-500")}>{conv.guest.name}</span>
                                    <span className="text-[10px] font-black text-neutral-300 whitespace-nowrap uppercase tracking-widest">{format(new Date(conv.lastMessageAt), 'MMM d')}</span>
                                </div>
                                <p className="text-[10px] font-black text-[#4F46E5] uppercase tracking-widest truncate mb-1.5">{conv.property?.name}</p>
                                <p className={cn("text-xs truncate", conv.unreadCountHost > 0 ? "text-[#0A0A0A] font-bold" : "text-neutral-400 font-medium")}>{conv.lastMessage}</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>

        {/* Chat Window */}
        <div className={cn("flex-1 flex flex-col h-full bg-[#FDFDFD]", showSidebar && "hidden md:flex")}>
            {activeConversationId && activeConversation ? (
                <>
                    <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-white/80 backdrop-blur-xl z-10 relative">
                         <div className="flex items-center gap-4">
                             {/* Mobile back button */}
                             <button onClick={() => setShowSidebar(true)} className="md:hidden p-2 -ml-2 text-neutral-400 hover:text-[#0A0A0A] bg-neutral-50 rounded-xl">
                               <X className="w-5 h-5" />
                             </button>
                             <div>
                               <h3 className="font-extrabold text-[#0A0A0A] text-lg tracking-tight">
                                   {activeConversation.guest.name}
                               </h3>
                               <p className="text-xs font-bold text-neutral-400 mt-0.5 tracking-wide">{activeConversation.property?.name}</p>
                             </div>
                         </div>
                         <button 
                             onClick={() => setShowContextDrawer(!showContextDrawer)}
                             className={cn("px-4 py-2.5 transition-all rounded-xl flex items-center gap-2 font-bold text-sm shadow-sm", showContextDrawer ? "bg-secondary-50 text-secondary-800 border border-secondary-200" : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-[#0A0A0A] hover:shadow-soft")}
                             title="Guest Context"
                         >
                             <span className="hidden xl:inline">Guest Details</span>
                             <Info className="w-4 h-4" />
                         </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFDFD]">
                         {loadingMessages ? (
                             <div className="flex justify-center p-8"><Loader2 className="animate-spin text-neutral-300" /></div>
                         ) : messages.length === 0 ? (
                             <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                                <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                                <p className="text-sm">No messages in this conversation yet.</p>
                             </div>
                         ) : (
                             messages.map(msg => {
                                 const isMe = msg.sender.id === currentUserId || msg.sender.id === 'me';
                                 return (
                                     <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                         <div className={cn(
                                             "max-w-[75%] rounded-[1.5rem] px-5 py-3 text-sm shadow-sm",
                                             isMe ? "bg-primary-500 text-white rounded-br-sm shadow-[0_4px_12px_rgba(231,64,53,0.15)]" : "bg-white border border-neutral-100 text-[#0A0A0A] rounded-bl-sm font-medium"
                                         )}>
                                             {msg.content}
                                             <div className={cn("text-[10px] mt-1.5 opacity-60 font-bold tracking-wider", isMe ? "text-white" : "text-neutral-500")}>
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
                    <div className="px-6 py-4 border-t border-neutral-100 bg-secondary-50/40 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2 text-secondary-800">
                             <div className="p-1.5 rounded-lg bg-secondary-100">
                               <Sparkles className="w-4 h-4 text-secondary-600" />
                             </div>
                             <span className="text-xs font-black uppercase tracking-widest">AI Co-Host</span>
                         </div>
                         <button
                            onClick={handleGenerateAIReply}
                            disabled={isGeneratingAI || messages.length === 0}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary-500 hover:bg-secondary-600 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
                         >
                            {isGeneratingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Context-Aware Draft'}
                         </button>
                      </div>
                      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                        {[
                          { label: '🔑 Check-in Info', text: 'Hi! Check-in is from 3:00 PM. I\'ll send you the access code the day before your arrival. Let me know if you need anything!' },
                          { label: '👋 Welcome', text: 'Welcome! I hope you have a wonderful stay. Don\'t hesitate to reach out if you need any recommendations or assistance.' },
                          { label: '🙏 Thank You', text: 'Thank you for your message! I\'ll get back to you shortly with all the details.' },
                        ].map((suggestion) => (
                          <button
                            key={suggestion.label}
                            type="button"
                            onClick={() => setNewMessage(suggestion.text)}
                            className="shrink-0 px-4 py-2 rounded-xl bg-white border border-secondary-200 text-xs font-bold text-secondary-900 hover:bg-secondary-50 transition-all hover:shadow-sm"
                          >
                            {suggestion.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleSendMessage} className="p-6 border-t border-neutral-100 bg-white">
                        <div className="relative flex items-center gap-3">
                            <input 
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                type="text" 
                                placeholder="Type a message..." 
                                className="flex-1 bg-white border border-neutral-200 shadow-sm hover:shadow-soft rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all text-[#0A0A0A] font-medium placeholder-neutral-400" 
                            />
                            <button 
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="p-4 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 disabled:opacity-50 transition-all shadow-md active:scale-95 hover:shadow-[0_8px_16px_rgba(231,64,53,0.25)]"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
                    <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                    <p>Select a conversation to start messaging</p>
                </div>
            )}
        </div>

        {/* Slide-out Context Drawer */}
        <AnimatePresence>
            {showContextDrawer && activeConversation && (
                <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 340, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="h-full border-l border-neutral-200 bg-neutral-50 flex flex-col overflow-hidden hidden lg:flex shrink-0 z-20"
                >
                    <div className="p-6 overflow-y-auto w-[340px]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-[#0A0A0A] tracking-tight">Context</h3>
                            <button onClick={() => setShowContextDrawer(false)} className="p-1.5 text-neutral-400 hover:bg-neutral-200 rounded-lg">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex flex-col items-center mb-8 text-center">
                            {activeConversation.guest.image ? (
                                <Image src={activeConversation.guest.image} alt="" width={80} height={80} className="rounded-full shadow-md border-4 border-white mb-3 object-cover" />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-3 shadow-inner border-4 border-white">
                                    <User className="w-10 h-10 text-indigo-400" />
                                </div>
                            )}
                            <h4 className="font-bold text-[#0A0A0A] text-xl tracking-tight leading-tight">{activeConversation.guest.name}</h4>
                            <p className="text-sm font-medium text-neutral-500">Verified Guest</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="bg-white p-5 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-12 bg-primary-500/5 rounded-full blur-xl -mr-6 -mt-6 group-hover:bg-primary-500/10 transition-colors" />
                                <h5 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3">Trip Info</h5>
                                <p className="text-base font-bold text-[#0A0A0A] mb-2 leading-tight">{activeConversation.property?.name}</p>
                                <div className="space-y-2 mt-4 pt-4 border-t border-neutral-100">
                                   <p className="text-xs font-semibold text-neutral-500 flex justify-between"><span>Status:</span> <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Upcoming</span></p>
                                   <p className="text-xs font-semibold text-neutral-500 flex justify-between"><span>Guests:</span> <span className="text-[#0A0A0A]">2 Adults, 1 Pet</span></p>
                                </div>
                            </div>
                            
                            <div className="bg-gradient-to-br from-secondary-50 to-amber-50 p-6 rounded-3xl border border-secondary-200 relative overflow-hidden group shadow-soft">
                                <div className="absolute -bottom-4 -right-4 text-secondary-500/20 group-hover:scale-110 transition-transform">
                                   <Sparkles className="w-24 h-24" />
                                </div>
                                <h5 className="text-[10px] font-black text-secondary-600 flex items-center gap-1.5 uppercase tracking-widest mb-3 relative z-10">
                                  <Sparkles className="w-4 h-4" /> AI Insight
                                </h5>
                                <p className="text-sm text-secondary-900 leading-relaxed font-bold relative z-10">
                                  This guest travels with a pet. Offering a preemptive link to local dog parks or your pet rules can secure a 5-star review!
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
}
