'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Phone, 
  User, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Send,
  Filter,
  Search,
  Mail,
  Headphones,
  Bot,
  Users,
  PhoneCall,
  MessageCircle
} from 'lucide-react';

interface SupportTicket {
  id: number;
  session_id?: string;
  source: string;
  user_name: string;
  user_email?: string;
  user_phone?: string;
  subject: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'closed';
  department: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message_at?: string;
}

interface TicketMessage {
  id: number;
  ticket_id: number;
  sender_type: 'customer' | 'agent' | 'system';
  sender_name: string;
  message: string;
  created_at: string;
}

interface WhatsAppConversation {
  id: number;
  phone: string;
  name?: string;
  status: string;
  created_at: string;
  updated_at: string;
  recent_message?: string;
}

export default function SupportDashboard() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [whatsappConversations, setWhatsappConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [filterStatus, setFilterStatus] = useState('open');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load tickets and conversations
  useEffect(() => {
    loadTickets();
    loadWhatsAppConversations();
  }, [filterStatus, filterPriority]);

  // Load ticket messages when ticket is selected
  useEffect(() => {
    if (selectedTicket) {
      loadTicketMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const loadTickets = async () => {
    try {
      const params = new URLSearchParams({
        status: filterStatus,
        ...(filterPriority !== 'all' && { priority: filterPriority }),
        limit: '100'
      });
      
      const response = await fetch(`/api/support/tickets?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWhatsAppConversations = async () => {
    try {
      const response = await fetch('/api/whatsapp/conversations');
      const data = await response.json();
      
      if (data.success) {
        setWhatsappConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error loading WhatsApp conversations:', error);
    }
  };

  const loadTicketMessages = async (ticketId: number) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/messages`);
      const data = await response.json();
      
      if (data.success) {
        setTicketMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading ticket messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      const response = await fetch(`/api/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          sender_type: 'agent',
          sender_name: 'Agente'
        })
      });

      if (response.ok) {
        setNewMessage('');
        loadTicketMessages(selectedTicket.id);
        loadTickets(); // Refresh ticket list
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const updateTicketStatus = async (ticketId: number, status: string) => {
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        loadTickets();
        if (selectedTicket?.id === ticketId) {
          setSelectedTicket({ ...selectedTicket, status: status as any });
        }
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'chat':
      case 'chat_transfer':
        return <Bot className="h-4 w-4" />;
      case 'whatsapp':
        return <MessageCircle className="h-4 w-4" />;
      case 'lead_form':
        return <Mail className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Atendimento</h1>
          <p className="text-gray-600">Gerencie tickets, chat e WhatsApp em um só lugar</p>
        </div>
        
        <div className="flex gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Headphones className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{tickets.filter(t => t.status === 'open').length}</p>
                <p className="text-sm text-gray-600">Tickets Abertos</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{whatsappConversations.filter(c => c.status === 'active').length}</p>
                <p className="text-sm text-gray-600">WhatsApp Ativo</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tickets">
            <MessageSquare className="h-4 w-4 mr-2" />
            Tickets de Suporte
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Users className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Abertos</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="closed">Fechados</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Prioridades</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ticket List */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-semibold">Tickets ({filteredTickets.length})</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredTickets.map((ticket) => (
                  <Card 
                    key={ticket.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {getSourceIcon(ticket.source)}
                          <span className="font-medium">#{ticket.id}</span>
                        </div>
                        <Badge className={`${getPriorityColor(ticket.priority)} text-white`}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      
                      <h4 className="font-medium truncate">{ticket.subject}</h4>
                      <p className="text-sm text-gray-600 mb-2">{ticket.user_name}</p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                        {ticket.message_count && (
                          <>
                            <MessageSquare className="h-3 w-3 ml-2" />
                            {ticket.message_count}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Ticket Details */}
            <div className="lg:col-span-2">
              {selectedTicket ? (
                <Card>
                  <CardHeader className="border-b">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {getSourceIcon(selectedTicket.source)}
                          Ticket #{selectedTicket.id}
                          <Badge className={`${getPriorityColor(selectedTicket.priority)} text-white`}>
                            {selectedTicket.priority}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{selectedTicket.subject}</CardDescription>
                      </div>
                      
                      <div className="flex gap-2">
                        <Select 
                          value={selectedTicket.status}
                          onValueChange={(status) => updateTicketStatus(selectedTicket.id, status)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Aberto</SelectItem>
                            <SelectItem value="in_progress">Em Progresso</SelectItem>
                            <SelectItem value="closed">Fechado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Cliente:</span> {selectedTicket.user_name}
                      </div>
                      <div>
                        <span className="font-medium">Fonte:</span> {selectedTicket.source}
                      </div>
                      {selectedTicket.user_email && (
                        <div>
                          <span className="font-medium">Email:</span> {selectedTicket.user_email}
                        </div>
                      )}
                      {selectedTicket.user_phone && (
                        <div>
                          <span className="font-medium">Telefone:</span> {selectedTicket.user_phone}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-4">
                    {/* Messages */}
                    <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                      {ticketMessages.map((msg) => (
                        <div 
                          key={msg.id}
                          className={`flex ${msg.sender_type === 'agent' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.sender_type === 'agent' 
                              ? 'bg-blue-500 text-white' 
                              : msg.sender_type === 'system'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-gray-200 text-gray-900'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium">{msg.sender_name}</span>
                              <span className="text-xs opacity-75">
                                {new Date(msg.created_at).toLocaleTimeString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Message Input */}
                    {selectedTicket.status !== 'closed' && (
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Digite sua resposta..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          rows={3}
                          className="flex-1"
                        />
                        <Button 
                          onClick={sendMessage}
                          disabled={!newMessage.trim()}
                          className="self-end"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center text-gray-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Selecione um ticket para ver os detalhes</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>Conversas WhatsApp</CardTitle>
              <CardDescription>Gerencie conversas ativas do WhatsApp</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {whatsappConversations.map((conversation) => (
                  <div key={conversation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="h-8 w-8 text-green-500" />
                      <div>
                        <h4 className="font-medium">
                          {conversation.name || 'Cliente WhatsApp'}
                        </h4>
                        <p className="text-sm text-gray-600">{conversation.phone}</p>
                        <p className="text-xs text-gray-500">
                          Última atividade: {new Date(conversation.updated_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <PhoneCall className="h-4 w-4 mr-2" />
                        Ver Conversa
                      </Button>
                    </div>
                  </div>
                ))}
                
                {whatsappConversations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma conversa WhatsApp ativa</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{tickets.length}</p>
                    <p className="text-sm text-gray-600">Total Tickets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {tickets.filter(t => t.priority === 'urgent' || t.priority === 'high').length}
                    </p>
                    <p className="text-sm text-gray-600">Alta Prioridade</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">
                      {tickets.filter(t => t.status === 'closed').length}
                    </p>
                    <p className="text-sm text-gray-600">Resolvidos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{whatsappConversations.length}</p>
                    <p className="text-sm text-gray-600">WhatsApp</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}