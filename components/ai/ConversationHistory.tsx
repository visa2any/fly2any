/**
 * Conversation History Component
 * Displays user's past AI conversations with search, filter, and management features
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, Calendar, User, Filter, Trash2, Eye, PlayCircle, Download, Mail } from 'lucide-react';
import type { ConversationState } from '@/lib/ai/conversation-persistence';

interface ConversationHistoryProps {
  /** Callback when user wants to resume a conversation */
  onResumeConversation?: (conversation: ConversationState) => void;
  /** Callback when user wants to view conversation details */
  onViewConversation?: (conversation: ConversationState) => void;
  /** Show in compact mode (for sidebar) */
  compact?: boolean;
  /** Maximum number of conversations to display initially */
  initialLimit?: number;
}

interface ConversationListItem extends ConversationState {
  previewText?: string;
  consultantName?: string;
}

export function ConversationHistory({
  onResumeConversation,
  onViewConversation,
  compact = false,
  initialLimit = 10,
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'abandoned'>('all');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Load conversations from API
  useEffect(() => {
    loadConversations();
  }, [initialLimit]);

  // Filter conversations based on search and status
  useEffect(() => {
    let filtered = [...conversations];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(conv => conv.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(conv => {
        const matchesPreview = conv.previewText?.toLowerCase().includes(query);
        const matchesConsultant = conv.consultantName?.toLowerCase().includes(query);
        const matchesDate = formatDate(conv.metadata.startedAt).toLowerCase().includes(query);
        return matchesPreview || matchesConsultant || matchesDate;
      });
    }

    setFilteredConversations(filtered);
  }, [conversations, searchQuery, statusFilter]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/ai/conversation/list?limit=${initialLimit}`);

      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }

      const data = await response.json();

      // Enrich conversations with preview text and consultant name
      const enriched = data.conversations.map((conv: ConversationState) => {
        const lastUserMessage = [...conv.messages]
          .reverse()
          .find(m => m.role === 'user');

        const lastAssistantMessage = [...conv.messages]
          .reverse()
          .find(m => m.role === 'assistant');

        return {
          ...conv,
          previewText: lastUserMessage?.content || 'No messages',
          consultantName: lastAssistantMessage?.consultant?.name || 'Travel Assistant',
        };
      });

      setConversations(enriched);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/ai/conversation/${conversationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      // Remove from local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    } catch (err) {
      console.error('Error deleting conversation:', err);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  const handleExportConversation = async (conversation: ConversationState) => {
    try {
      // Create JSON export
      const exportData = {
        id: conversation.id,
        sessionId: conversation.sessionId,
        date: new Date(conversation.metadata.startedAt).toISOString(),
        messages: conversation.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          consultant: msg.consultant?.name,
          timestamp: new Date(msg.timestamp).toISOString(),
        })),
        metadata: conversation.metadata,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${conversation.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting conversation:', err);
      alert('Failed to export conversation. Please try again.');
    }
  };

  const handleEmailConversation = async (conversation: ConversationState) => {
    // This would integrate with an email API
    // For now, we'll create a mailto link with the conversation summary
    const subject = `Conversation from ${formatDate(conversation.metadata.startedAt)}`;
    const body = `Conversation Summary:\n\nDate: ${formatDate(conversation.metadata.startedAt)}\nMessages: ${conversation.metadata.messageCount}\n\nView full conversation at: ${window.location.origin}/conversation/${conversation.id}`;

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  function formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'abandoned':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusIcon(status: string): React.ReactNode {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />;
      case 'completed':
        return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
      case 'abandoned':
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      default:
        return null;
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <p className="text-gray-600 dark:text-gray-400">Loading your conversations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-red-500 text-center">
          <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Failed to load conversations</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{error}</p>
        </div>
        <button
          onClick={loadConversations}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <MessageCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No conversations yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm">
          Start chatting with our AI travel assistants to see your conversation history here.
        </p>
      </div>
    );
  }

  // Compact view for sidebar
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Recent Conversations
          </h3>
          <span className="text-xs text-gray-500">
            {conversations.length}
          </span>
        </div>
        <div className="space-y-1">
          {filteredConversations.slice(0, 5).map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onViewConversation?.(conversation)}
              className="w-full text-left p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(conversation.status)}
                    <span className="text-xs text-gray-500">
                      {formatDate(conversation.metadata.startedAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white truncate">
                    {conversation.consultantName}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {conversation.previewText}
                  </p>
                </div>
                <PlayCircle className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0 ml-2" />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Conversation History
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your past conversations with our AI travel assistants
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
          {(['all', 'active', 'completed', 'abandoned'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
          <span className="text-sm text-gray-500 ml-auto">
            {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">
              No conversations found matching your filters.
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 transition-all ${
                selectedConversation === conversation.id
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="p-4">
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                      {conversation.consultantName?.[0] || 'AI'}
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        {conversation.consultantName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(conversation.metadata.startedAt)}
                        </span>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatTime(conversation.metadata.startedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                      {getStatusIcon(conversation.status)}
                      {conversation.status}
                    </span>
                  </div>
                </div>

                {/* Preview Text */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {conversation.previewText}
                </p>

                {/* Metadata Row */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{conversation.metadata.messageCount} messages</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="capitalize">{conversation.metadata.platform}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {conversation.status === 'active' && onResumeConversation && (
                    <button
                      onClick={() => onResumeConversation(conversation)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <PlayCircle className="w-4 h-4" />
                      Resume
                    </button>
                  )}
                  {onViewConversation && (
                    <button
                      onClick={() => {
                        setSelectedConversation(conversation.id);
                        onViewConversation(conversation);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  )}
                  <button
                    onClick={() => handleExportConversation(conversation)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    title="Export as JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEmailConversation(conversation)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    title="Email conversation"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteConversation(conversation.id)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium ml-auto"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
