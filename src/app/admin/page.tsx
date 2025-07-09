'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Lead {
  id: string;
  tipo: 'voos' | 'hoteis' | 'carros' | 'passeios' | 'seguro';
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  whatsapp?: string;
  status: 'novo' | 'em_analise' | 'cotado' | 'proposta_enviada' | 'fechado' | 'perdido' | 'follow_up';
  prioridade: 'alta' | 'media' | 'baixa';
  data: string;
  ultimaInteracao: string;
  valor?: number;
  observacoes?: string;
  detalhes: Record<string, string | number>;
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Ctrl+K: Clear filters
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setSearchTerm('');
        setStatusFilter('');
      }
      // Ctrl+D: Toggle dark mode
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        toggleDarkMode();
      }
      // Escape: Close modal
      if (e.key === 'Escape' && selectedLead) {
        setSelectedLead(null);
      }
      // Ctrl+F: Focus search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Nome, email"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [selectedLead]);

  // Dados mock para demonstração
  const mockLeads: Lead[] = [
    {
      id: '1',
      tipo: 'voos',
      nome: 'Maria',
      sobrenome: 'Silva',
      email: 'maria@email.com',
      telefone: '+1 (555) 123-4567',
      whatsapp: '+1 (555) 123-4567',
      status: 'novo',
      prioridade: 'alta',
      data: '2024-01-15T10:30:00Z',
      ultimaInteracao: '2024-01-15T10:30:00Z',
      valor: 1250,
      observacoes: 'Cliente interessado em voo para férias em família. Prefere horários matutinos.',
      detalhes: {
        origem: 'MIA - Miami International',
        destino: 'GRU - São Paulo/Guarulhos',
        dataIda: '15/02/2024',
        dataVolta: '28/02/2024',
        adultos: 2,
        criancas: 1,
        classe: 'Econômica Premium',
        flexibilidade: 'Até 3 dias'
      }
    },
    {
      id: '2',
      tipo: 'hoteis',
      nome: 'João',
      sobrenome: 'Santos',
      email: 'joao@email.com',
      telefone: '+1 (555) 987-6543',
      status: 'em_analise',
      prioridade: 'media',
      data: '2024-01-14T14:15:00Z',
      ultimaInteracao: '2024-01-14T16:20:00Z',
      valor: 800,
      observacoes: 'Procura hotel 4 estrelas próximo à praia. Lua de mel.',
      detalhes: {
        destino: 'Rio de Janeiro - Copacabana',
        checkin: '10/02/2024',
        checkout: '17/02/2024',
        adultos: 2,
        quartos: 1,
        categoria: '4 estrelas superior',
        amenidades: 'Vista mar, spa'
      }
    },
    {
      id: '3',
      tipo: 'carros',
      nome: 'Ana',
      sobrenome: 'Costa',
      email: 'ana@email.com',
      telefone: '+1 (555) 456-7890',
      status: 'cotado',
      prioridade: 'baixa',
      data: '2024-01-13T09:45:00Z',
      ultimaInteracao: '2024-01-13T11:30:00Z',
      valor: 420,
      detalhes: {
        local: 'Aeroporto GRU - Terminal 3',
        dataRetirada: '20/02/2024 - 14:00',
        dataEntrega: '27/02/2024 - 10:00',
        categoria: 'Compacto Automático',
        seguro: 'Proteção Total',
        condutor: 'Principal + 1 adicional'
      }
    },
    {
      id: '4',
      tipo: 'passeios',
      nome: 'Carlos',
      sobrenome: 'Mendes',
      email: 'carlos@email.com',
      telefone: '+1 (555) 321-0987',
      status: 'proposta_enviada',
      prioridade: 'alta',
      data: '2024-01-12T16:20:00Z',
      ultimaInteracao: '2024-01-13T09:15:00Z',
      valor: 3200,
      observacoes: 'Família com adolescentes. Interessados em ecoturismo e aventura.',
      detalhes: {
        destino: 'Amazônia - Manaus',
        duracao: '7 dias / 6 noites',
        pessoas: 4,
        tipo: 'Ecoturismo Premium',
        hospedagem: 'Lodge na floresta',
        atividades: 'Pesca, trilhas, canoa'
      }
    },
    {
      id: '5',
      tipo: 'seguro',
      nome: 'Fernanda',
      sobrenome: 'Lima',
      email: 'fernanda@email.com',
      telefone: '+1 (555) 654-3210',
      status: 'fechado',
      prioridade: 'media',
      data: '2024-01-11T13:30:00Z',
      ultimaInteracao: '2024-01-12T10:45:00Z',
      valor: 180,
      detalhes: {
        destino: 'Brasil - Múltiplas cidades',
        duracao: '21 dias',
        cobertura: 'Completa Plus',
        valorCobertura: 'USD 150,000',
        esportes: 'Incluído',
        covid: 'Cobertura total'
      }
    }
  ];

  // Atualizar hora a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Verificar se já está logado ao carregar a página
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('admin_logged_in');
    const savedDarkMode = localStorage.getItem('admin_dark_mode') === 'true';
    if (isLoggedIn === 'true') {
      setIsAuthenticated(true);
    }
    setIsDarkMode(savedDarkMode);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('admin_logged_in', 'true');
    } else {
      alert('Senha incorreta');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_logged_in');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('admin_dark_mode', newDarkMode.toString());
  };

  const filteredLeads = mockLeads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.sobrenome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Cores adaptativas para modo claro/escuro
  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8fafc',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f1f5f9' : '#1e293b',
    textSecondary: isDarkMode ? '#cbd5e1' : '#64748b',
    textMuted: isDarkMode ? '#94a3b8' : '#94a3b8',
    border: isDarkMode ? '#334155' : '#e2e8f0',
    headerBg: isDarkMode ? '#1e293b' : '#ffffff',
    modalBg: isDarkMode ? '#1e293b' : '#ffffff',
    inputBg: isDarkMode ? '#334155' : '#ffffff',
    inputBorder: isDarkMode ? '#475569' : '#d1d5db',
    shadow: isDarkMode ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    accent: '#3b82f6'
  };

  const getStatusColor = (status: Lead['status']) => {
    const colors = {
      novo: '#3b82f6',
      em_analise: '#f59e0b',
      cotado: '#8b5cf6',
      proposta_enviada: '#f97316',
      fechado: '#10b981',
      perdido: '#ef4444',
      follow_up: '#6366f1'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityIndicator = (prioridade: Lead['prioridade']) => {
    const indicators = {
      alta: { color: '#ef4444', symbol: '🔴', text: 'Alta' },
      media: { color: '#f59e0b', symbol: '🟡', text: 'Média' },
      baixa: { color: '#10b981', symbol: '🟢', text: 'Baixa' }
    };
    return indicators[prioridade];
  };

  const getStatusText = (status: Lead['status']) => {
    const texts = {
      novo: 'Novo',
      em_analise: 'Em Análise',
      cotado: 'Cotado',
      proposta_enviada: 'Proposta Enviada',
      fechado: 'Fechado',
      perdido: 'Perdido',
      follow_up: 'Follow-up'
    };
    return texts[status];
  };

  const getTipoIcon = (tipo: Lead['tipo']) => {
    const icons = {
      voos: '✈️',
      hoteis: '🏨',
      carros: '🚗',
      passeios: '🎯',
      seguro: '🛡️'
    };
    return icons[tipo];
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStats = () => {
    const total = mockLeads.length;
    const novos = mockLeads.filter(l => l.status === 'novo').length;
    const emAnalise = mockLeads.filter(l => l.status === 'em_analise').length;
    const fechados = mockLeads.filter(l => l.status === 'fechado').length;
    const totalValor = mockLeads.reduce((sum, lead) => sum + (lead.valor || 0), 0);
    const altaPrioridade = mockLeads.filter(l => l.prioridade === 'alta').length;
    
    return { total, novos, emAnalise, fechados, totalValor, altaPrioridade };
  };

  const stats = getStats();

  // Função para copiar informação
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} copiado para a área de transferência!`);
    });
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '20px',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px auto',
              fontSize: '32px'
            }}>
              🔐
            </div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: '12px',
              letterSpacing: '-0.025em'
            }}>
              Painel Administrativo
            </h2>
            <p style={{ 
              color: '#64748b',
              fontSize: '16px',
              lineHeight: '1.6'
            }}>
              Acesse o dashboard para gerenciar leads e acompanhar métricas
            </p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '10px'
              }}>
                Senha de Acesso
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#f9fafb'
                }}
                placeholder="Digite sua senha"
                required
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.backgroundColor = '#f9fafb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <button
              type="submit"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                color: 'white',
                fontWeight: '600',
                padding: '16px 20px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Entrar no Dashboard
            </button>
          </form>
          
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <Link 
              href="/" 
              style={{
                color: '#3b82f6',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: '500',
                transition: 'color 0.2s ease'
              }}
            >
              ← Voltar ao site principal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: theme.bg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: theme.headerBg,
        boxShadow: theme.shadow,
        borderBottom: `1px solid ${theme.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: 'all 0.3s ease'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: '72px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                📊
              </div>
              <div>
                <h1 style={{
                  fontSize: '22px',
                  fontWeight: '700',
                  color: theme.text,
                  margin: 0,
                  letterSpacing: '-0.025em'
                }}>Dashboard Admin</h1>
                <p style={{
                  fontSize: '14px',
                  color: theme.textSecondary,
                  margin: 0
                }}>Fly2Any - Gestão de Leads • {formatTime(currentTime)}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Estatísticas rápidas no header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '24px',
                fontSize: '14px',
                color: theme.textSecondary 
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '700', color: theme.accent, fontSize: '18px' }}>{stats.novos}</div>
                  <div>Novos</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: '700', color: '#f59e0b', fontSize: '18px' }}>{stats.altaPrioridade}</div>
                  <div>Urgentes</div>
                </div>
              </div>

              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.cardBg,
                  color: theme.text,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  transition: 'all 0.2s ease'
                }}
                title={isDarkMode ? 'Modo Claro (Ctrl+D)' : 'Modo Escuro (Ctrl+D)'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              <Link 
                href="/" 
                style={{
                  color: theme.textSecondary,
                  textDecoration: 'none',
                  fontWeight: '500',
                  fontSize: '15px',
                  transition: 'color 0.2s ease'
                }}
              >
                Ver Site
              </Link>
              
              <button
                onClick={handleLogout}
                style={{
                  backgroundColor: isDarkMode ? '#991b1b' : '#fef2f2',
                  color: isDarkMode ? '#fca5a5' : '#b91c1c',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '500',
                  border: `1px solid ${isDarkMode ? '#7f1d1d' : '#fecaca'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#7f1d1d' : '#fee2e2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#991b1b' : '#fef2f2';
                }}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        {/* Estatísticas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: theme.cardBg,
            borderRadius: '16px',
            padding: '28px',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ 
                  fontSize: '14px', 
                  color: theme.textMuted, 
                  margin: '0 0 8px 0',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Total de Leads</p>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: '800', 
                  color: theme.text, 
                  margin: 0,
                  lineHeight: '1'
                }}>{stats.total}</p>
                <p style={{ 
                  fontSize: '13px', 
                  color: theme.textSecondary, 
                  margin: '4px 0 0 0' 
                }}>Este mês</p>
              </div>
              <div style={{ 
                fontSize: '32px',
                opacity: 0.8,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                padding: '12px',
                borderRadius: '12px'
              }}>👥</div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: theme.cardBg,
            borderRadius: '16px',
            padding: '28px',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ 
                  fontSize: '14px', 
                  color: theme.textMuted, 
                  margin: '0 0 8px 0',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Novos Leads</p>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: '800', 
                  color: '#3b82f6', 
                  margin: 0,
                  lineHeight: '1'
                }}>{stats.novos}</p>
                <p style={{ 
                  fontSize: '13px', 
                  color: theme.textSecondary, 
                  margin: '4px 0 0 0' 
                }}>Precisam atenção</p>
              </div>
              <div style={{ 
                fontSize: '32px',
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '12px',
                borderRadius: '12px'
              }}>🆕</div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: theme.cardBg,
            borderRadius: '16px',
            padding: '28px',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ 
                  fontSize: '14px', 
                  color: theme.textMuted, 
                  margin: '0 0 8px 0',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Em Análise</p>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: '800', 
                  color: '#f59e0b', 
                  margin: 0,
                  lineHeight: '1'
                }}>{stats.emAnalise}</p>
                <p style={{ 
                  fontSize: '13px', 
                  color: theme.textSecondary, 
                  margin: '4px 0 0 0' 
                }}>Em progresso</p>
              </div>
              <div style={{ 
                fontSize: '32px',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '12px',
                borderRadius: '12px'
              }}>⏳</div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: theme.cardBg,
            borderRadius: '16px',
            padding: '28px',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ 
                  fontSize: '14px', 
                  color: theme.textMuted, 
                  margin: '0 0 8px 0',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Fechados</p>
                <p style={{ 
                  fontSize: '32px', 
                  fontWeight: '800', 
                  color: '#10b981', 
                  margin: 0,
                  lineHeight: '1'
                }}>{stats.fechados}</p>
                <p style={{ 
                  fontSize: '13px', 
                  color: theme.textSecondary, 
                  margin: '4px 0 0 0' 
                }}>Sucesso</p>
              </div>
              <div style={{ 
                fontSize: '32px',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '12px',
                borderRadius: '12px'
              }}>✅</div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: theme.cardBg,
            borderRadius: '16px',
            padding: '28px',
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ 
                  fontSize: '14px', 
                  color: theme.textMuted, 
                  margin: '0 0 8px 0',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>Receita Total</p>
                <p style={{ 
                  fontSize: '28px', 
                  fontWeight: '800', 
                  color: '#8b5cf6', 
                  margin: 0,
                  lineHeight: '1'
                }}>{formatCurrency(stats.totalValor)}</p>
                <p style={{ 
                  fontSize: '13px', 
                  color: theme.textSecondary, 
                  margin: '4px 0 0 0' 
                }}>Valor estimado</p>
              </div>
              <div style={{ 
                fontSize: '32px',
                background: 'rgba(139, 92, 246, 0.1)',
                padding: '12px',
                borderRadius: '12px'
              }}>💰</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div style={{
          backgroundColor: theme.cardBg,
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '24px',
          boxShadow: theme.shadow,
          border: `1px solid ${theme.border}`,
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '600',
                color: theme.text,
                marginBottom: '10px'
              }}>
                🔍 Buscar Leads
              </label>
              <input
                type="text"
                placeholder="Nome, email ou telefone... (Ctrl+F para focar)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: `2px solid ${theme.inputBorder}`,
                  borderRadius: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  fontSize: '15px',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.accent;
                  e.target.style.boxShadow = `0 0 0 3px ${theme.accent}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '15px',
                fontWeight: '600',
                color: theme.text,
                marginBottom: '10px'
              }}>
                📊 Filtrar por Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: `2px solid ${theme.inputBorder}`,
                  borderRadius: '12px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: theme.inputBg,
                  color: theme.text,
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = theme.accent;
                  e.target.style.boxShadow = `0 0 0 3px ${theme.accent}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = theme.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Todos os Status</option>
                <option value="novo">🆕 Novo</option>
                <option value="em_analise">⏳ Em Análise</option>
                <option value="cotado">💜 Cotado</option>
                <option value="proposta_enviada">📧 Proposta Enviada</option>
                <option value="fechado">✅ Fechado</option>
                <option value="perdido">❌ Perdido</option>
                <option value="follow_up">🔄 Follow-up</option>
              </select>
            </div>
            
            <div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                style={{
                  padding: '14px 24px',
                  backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                  color: theme.text,
                  borderRadius: '12px',
                  border: `2px solid ${theme.border}`,
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f3f4f6';
                }}
              >
                🗑️ Limpar Filtros (Ctrl+K)
              </button>
            </div>
          </div>
        </div>

        {/* Tabela de Leads */}
        <div style={{
          backgroundColor: theme.cardBg,
          borderRadius: '16px',
          boxShadow: theme.shadow,
          border: `1px solid ${theme.border}`,
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            padding: '28px',
            borderBottom: `1px solid ${theme.border}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: theme.text,
                margin: 0
              }}>
                📋 Leads Ativos ({filteredLeads.length})
              </h2>
              <div style={{
                fontSize: '14px',
                color: theme.textSecondary,
                background: isDarkMode ? '#374151' : '#f1f5f9',
                padding: '8px 12px',
                borderRadius: '8px'
              }}>
                Atualizado há poucos minutos
              </div>
            </div>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: '15px'
            }}>
              <thead style={{ backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc' }}>
                <tr>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: theme.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Cliente
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: theme.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Serviço
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: theme.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Status & Prioridade
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: theme.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Valor
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: theme.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Data
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: theme.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, index) => (
                  <tr key={lead.id} style={{
                    borderBottom: index < filteredLeads.length - 1 ? `1px solid ${theme.border}` : 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '16px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}>
                          {lead.nome[0]}{lead.sobrenome[0]}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: theme.text,
                            lineHeight: '1.4'
                          }}>
                            {lead.nome} {lead.sobrenome}
                          </div>
                          <div style={{
                            fontSize: '14px',
                            color: theme.textSecondary,
                            lineHeight: '1.4',
                            cursor: 'pointer'
                          }}
                          onClick={() => copyToClipboard(lead.email, 'Email')}>
                            {lead.email}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: theme.textMuted,
                            lineHeight: '1.4',
                            cursor: 'pointer'
                          }}
                          onClick={() => copyToClipboard(lead.telefone, 'Telefone')}>
                            {lead.telefone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '24px' }}>{getTipoIcon(lead.tipo)}</span>
                        <div>
                          <div style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: theme.text,
                            textTransform: 'capitalize',
                            lineHeight: '1.4'
                          }}>
                            {lead.tipo}
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: theme.textSecondary,
                            lineHeight: '1.4'
                          }}>
                            {lead.tipo === 'voos' && 'Passagens Aéreas'}
                            {lead.tipo === 'hoteis' && 'Hospedagem'}
                            {lead.tipo === 'carros' && 'Aluguel de Veículos'}
                            {lead.tipo === 'passeios' && 'Turismo'}
                            {lead.tipo === 'seguro' && 'Proteção Viagem'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{
                          display: 'inline-flex',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: '20px',
                          backgroundColor: `${getStatusColor(lead.status)}20`,
                          color: getStatusColor(lead.status),
                          lineHeight: '1'
                        }}>
                          {getStatusText(lead.status)}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px' }}>
                            {getPriorityIndicator(lead.prioridade).symbol}
                          </span>
                          <span style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: getPriorityIndicator(lead.prioridade).color
                          }}>
                            {getPriorityIndicator(lead.prioridade).text}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '20px 24px',
                      fontSize: '16px',
                      fontWeight: '700',
                      color: lead.valor ? '#10b981' : theme.textMuted
                    }}>
                      {lead.valor ? formatCurrency(lead.valor) : '—'}
                    </td>
                    <td style={{
                      padding: '20px 24px',
                      fontSize: '14px',
                      color: theme.textSecondary
                    }}>
                      <div style={{ lineHeight: '1.4' }}>
                        {formatDate(lead.data)}
                      </div>
                    </td>
                    <td style={{ padding: '20px 24px' }}>
                      <button
                        onClick={() => setSelectedLead(lead)}
                        style={{
                          color: theme.accent,
                          backgroundColor: `${theme.accent}10`,
                          border: `1px solid ${theme.accent}30`,
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${theme.accent}20`;
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${theme.accent}10`;
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedLead && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            backgroundColor: theme.modalBg,
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{
              padding: '32px',
              borderBottom: `1px solid ${theme.border}`,
              backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
              borderRadius: '20px 20px 0 0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '24px',
                    boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.3)'
                  }}>
                    {selectedLead.nome[0]}{selectedLead.sobrenome[0]}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: theme.text,
                      margin: 0,
                      lineHeight: '1.2'
                    }}>
                      {selectedLead.nome} {selectedLead.sobrenome}
                    </h3>
                    <p style={{
                      fontSize: '16px',
                      color: theme.textSecondary,
                      margin: '4px 0 0 0'
                    }}>
                      {selectedLead.email} • {selectedLead.telefone}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                      <span style={{
                        display: 'inline-flex',
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        borderRadius: '20px',
                        backgroundColor: `${getStatusColor(selectedLead.status)}20`,
                        color: getStatusColor(selectedLead.status)
                      }}>
                        {getStatusText(selectedLead.status)}
                      </span>
                      <span style={{
                        fontSize: '14px',
                        color: getPriorityIndicator(selectedLead.prioridade).color,
                        fontWeight: '600'
                      }}>
                        {getPriorityIndicator(selectedLead.prioridade).symbol} {getPriorityIndicator(selectedLead.prioridade).text}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  style={{
                    color: theme.textMuted,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '28px',
                    padding: '8px',
                    borderRadius: '8px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDarkMode ? '#374151' : '#f1f5f9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            
            <div style={{ padding: '32px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '32px'
              }}>
                {/* Informações do Cliente */}
                <div>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: theme.text,
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📋 Informações do Cliente
                  </h4>
                  <div style={{
                    backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
                    borderRadius: '12px',
                    padding: '24px',
                    lineHeight: '1.6'
                  }}>
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textMuted }}>Nome Completo:</span>
                      <div style={{ fontSize: '16px', color: theme.text, marginTop: '4px', fontWeight: '500' }}>
                        {selectedLead.nome} {selectedLead.sobrenome}
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textMuted }}>Email:</span>
                      <div style={{ 
                        fontSize: '16px', 
                        color: theme.accent, 
                        marginTop: '4px',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                      onClick={() => copyToClipboard(selectedLead.email, 'Email')}>
                        {selectedLead.email}
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textMuted }}>Telefone:</span>
                      <div style={{ 
                        fontSize: '16px', 
                        color: theme.text, 
                        marginTop: '4px',
                        cursor: 'pointer'
                      }}
                      onClick={() => copyToClipboard(selectedLead.telefone, 'Telefone')}>
                        {selectedLead.telefone}
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textMuted }}>Serviço:</span>
                      <div style={{ fontSize: '16px', color: theme.text, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '20px' }}>{getTipoIcon(selectedLead.tipo)}</span>
                        {selectedLead.tipo.charAt(0).toUpperCase() + selectedLead.tipo.slice(1)}
                      </div>
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textMuted }}>Data do Lead:</span>
                      <div style={{ fontSize: '16px', color: theme.text, marginTop: '4px' }}>
                        {formatDate(selectedLead.data)}
                      </div>
                    </div>
                    {selectedLead.valor && (
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textMuted }}>Valor Estimado:</span>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981', marginTop: '4px' }}>
                          {formatCurrency(selectedLead.valor)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Detalhes da Cotação */}
                <div>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: theme.text,
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📝 Detalhes da Cotação
                  </h4>
                  <div style={{
                    backgroundColor: isDarkMode ? '#334155' : '#f8fafc',
                    borderRadius: '12px',
                    padding: '24px',
                    lineHeight: '1.6'
                  }}>
                    {Object.entries(selectedLead.detalhes).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: '16px' }}>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: theme.textMuted,
                          textTransform: 'capitalize'
                        }}>
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                        </span>
                        <div style={{ 
                          fontSize: '16px', 
                          color: theme.text, 
                          marginTop: '4px',
                          fontWeight: '500'
                        }}>
                          {String(value)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Observações */}
              {selectedLead.observacoes && (
                <div style={{ marginTop: '32px' }}>
                  <h4 style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: theme.text,
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    💭 Observações e Notas
                  </h4>
                  <div style={{
                    backgroundColor: isDarkMode ? '#1e40af' : '#dbeafe',
                    border: `2px solid ${isDarkMode ? '#3b82f6' : '#93c5fd'}`,
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <p style={{
                      fontSize: '16px',
                      color: isDarkMode ? '#dbeafe' : '#1e40af',
                      margin: 0,
                      lineHeight: '1.6',
                      fontWeight: '500'
                    }}>
                      {selectedLead.observacoes}
                    </p>
                  </div>
                </div>
              )}

              {/* Ações Rápidas */}
              <div style={{ marginTop: '32px' }}>
                <h4 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: theme.text,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ⚡ Ações Rápidas
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '12px'
                }}>
                  <button
                    onClick={() => window.open(`tel:${selectedLead.telefone}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#059669';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#10b981';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    📞 Ligar
                  </button>
                  <button
                    onClick={() => window.open(`mailto:${selectedLead.email}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#2563eb';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#3b82f6';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    ✉️ Email
                  </button>
                  <button
                    onClick={() => window.open(`https://wa.me/${selectedLead.whatsapp?.replace(/[^0-9]/g, '') || ''}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      backgroundColor: '#22c55e',
                      color: 'white',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#16a34a';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#22c55e';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    💬 WhatsApp
                  </button>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#7c3aed';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#8b5cf6';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    📊 Cotação
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}