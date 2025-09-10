'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, RefreshCw, Users } from 'lucide-react';
import { ConversationWithDetails } from '@/lib/omnichannel-api';

interface ConversationsListProps {
  onConversationSelect: (conversation: ConversationWithDetails) => void;
  selectedConversationId?: string;
}

export default function ConversationsList({ 
  onConversationSelect, 
  selectedConversationId 
}: ConversationsListProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/omnichannel/conversations?limit=50');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations || []);
      } else {
        setError(data.error || 'Failed to load conversations');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const formatLastMessage = (conversation: ConversationWithDetails) => {
    if (conversation.last_message?.content) {
      return conversation.last_message.content.length > 50 
        ? `${conversation.last_message.content.substring(0, 50)}...`
        : conversation.last_message.content;
    }
    return 'No messages yet...';
  };

  const formatTimeAgo = (timestamp: string | Date | undefined) => {
    if (!timestamp) return 'never';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
      return `${Math.floor(diffMins / 1440)}d`;
    } catch (error) {
      console.warn('Invalid timestamp:', timestamp);
      return 'unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'resolved': return 'bg-blue-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return '💬';
      case 'email': return '📧';
      case 'webchat': return '🌐';
      case 'phone': return '📞';
      case 'instagram': return '📷';
      case 'facebook': return '📘';
      default: return '💬';
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card h-[calc(100vh-160px)]">
        <CardHeader className="border-b border-border/50 p-4">
          <CardTitle className="text-lg font-bold flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <span>Conversations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[calc(100vh-240px)] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
              <span className="text-sm text-muted-foreground">Loading conversations...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 bg-card h-[calc(100vh-160px)]">
      <CardHeader className="border-b border-border/50 p-4">
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </div>
            <span>Conversations</span>
            <Badge variant="secondary" className="ml-2">
              {conversations.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchConversations}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[calc(100vh-240px)] overflow-y-auto">
          {error ? (
            <div className="p-4 text-center">
              <div className="text-red-500 font-medium mb-2">Error loading conversations</div>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchConversations} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Conversations will appear here when customers start interacting with your channels.
              </p>
              <Button onClick={fetchConversations} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border/50 ${
                    selectedConversationId === conversation.id.toString() 
                      ? 'bg-muted border-border' 
                      : ''
                  }`}
                  onClick={() => onConversationSelect(conversation)}
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {conversation.customer?.name 
                        ? conversation.customer.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                        : (conversation.customer?.email 
                           ? conversation.customer.email.substring(0, 2).toUpperCase() 
                           : 'UN')
                      }
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(conversation.status)} rounded-full border-2 border-background`}></div>
                    <div className="absolute -top-0.5 -left-0.5 text-xs">
                      {getChannelIcon(conversation.channel)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm truncate">
                        {conversation.customer?.name || 'Unknown Customer'}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {conversation.last_message?.created_at 
                          ? formatTimeAgo(conversation.last_message.created_at)
                          : formatTimeAgo(conversation.updated_at)
                        }
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatLastMessage(conversation)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {conversation.channel}
                      </Badge>
                      <Badge 
                        variant={conversation.status === 'open' ? 'default' : 'secondary'}
                        className="text-xs px-1.5 py-0.5"
                      >
                        {conversation.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}