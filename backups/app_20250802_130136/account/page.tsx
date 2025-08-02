'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Hotel, 
  Plane, 
  Car, 
  MapPin, 
  Shield, 
  Bell, 
  Settings,
  Calendar,
  CreditCard,
  Download,
  Eye,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface BookingItem {
  id: string;
  type: 'hotel' | 'flight' | 'car' | 'tour' | 'insurance';
  title: string;
  subtitle: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  date: string;
  price: string;
  bookingRef: string;
  location?: string;
}

const MOCK_BOOKINGS: BookingItem[] = [
  {
    id: '1',
    type: 'hotel',
    title: 'Copacabana Palace',
    subtitle: '3 noites • 2 adultos',
    status: 'confirmed',
    date: '2024-08-15',
    price: 'R$ 2.850,00',
    bookingRef: 'FLY2ANY-HTL-001',
    location: 'Rio de Janeiro, RJ'
  },
  {
    id: '2',
    type: 'flight',
    title: 'São Paulo → Rio de Janeiro',
    subtitle: 'TAM Linhas Aéreas • Ida e volta',
    status: 'confirmed',
    date: '2024-08-14',
    price: 'R$ 890,00',
    bookingRef: 'FLY2ANY-FLT-002',
    location: 'GRU → SDU'
  },
  {
    id: '3',
    type: 'car',
    title: 'Volkswagen Polo',
    subtitle: '4 dias • Categoria Econômica',
    status: 'pending',
    date: '2024-08-15',
    price: 'R$ 320,00',
    bookingRef: 'FLY2ANY-CAR-003',
    location: 'Rio de Janeiro, RJ'
  }
];

const getProductIcon = (type: string) => {
  switch (type) {
    case 'hotel': return <Hotel size={20} className="text-blue-600" />;
    case 'flight': return <Plane size={20} className="text-green-600" />;
    case 'car': return <Car size={20} className="text-orange-600" />;
    case 'tour': return <MapPin size={20} className="text-purple-600" />;
    case 'insurance': return <Shield size={20} className="text-red-600" />;
    default: return <Calendar size={20} className="text-gray-600" />;
  }
};

const getStatusBadge = (status: string) => {
  const styles = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800'
  };

  const labels = {
    confirmed: 'Confirmado',
    pending: 'Pendente',
    cancelled: 'Cancelado',
    completed: 'Concluído'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  );
};

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState<BookingItem[]>([]);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login?callbackUrl=/account');
      return;
    }

    // Load user bookings
    setBookings(MOCK_BOOKINGS);
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const tabs = [
    { id: 'bookings', label: 'Minhas Reservas', icon: Calendar },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'payment', label: 'Pagamentos', icon: CreditCard },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
              <p className="text-gray-600">Gerencie suas reservas e preferências</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {session.user?.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-sm text-gray-600">{session.user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-xl shadow-sm p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Quick Stats */}
            <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Resumo</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total de Reservas</span>
                  <span className="font-semibold">{bookings.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pontos Fly2Any</span>
                  <span className="font-semibold text-blue-600">2.540</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nível</span>
                  <span className="font-semibold text-amber-600 flex items-center gap-1">
                    <Star size={14} />
                    Gold
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Minhas Reservas
                    </h2>
                    <Link
                      href="/hoteis"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Nova Reserva
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getProductIcon(booking.type)}
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {booking.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {booking.subtitle}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Data</p>
                            <p className="text-sm font-medium">
                              {new Date(booking.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Código</p>
                            <p className="text-sm font-mono font-medium">
                              {booking.bookingRef}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Local</p>
                            <p className="text-sm font-medium">
                              {booking.location || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Valor</p>
                            <p className="text-sm font-semibold text-green-600">
                              {booking.price}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <Eye size={14} />
                            Ver Detalhes
                          </button>
                          <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                            <Download size={14} />
                            Voucher
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {bookings.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Nenhuma reserva encontrada
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Comece planejando sua próxima viagem
                      </p>
                      <Link
                        href="/hoteis"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Hotel size={20} />
                        Buscar Hotéis
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações Pessoais</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                      <input
                        type="text"
                        value={session.user?.name || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={session.user?.email || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                      <input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                      <input
                        type="text"
                        placeholder="000.000.000-00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Métodos de Pagamento</h2>
                  
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CreditCard size={20} className="text-gray-600" />
                          <div>
                            <p className="font-medium text-gray-900">**** **** **** 4242</p>
                            <p className="text-sm text-gray-600">Expires 12/25</p>
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Principal</span>
                      </div>
                    </div>
                    
                    <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                      + Adicionar novo cartão
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferências de Notificação</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Confirmação de Reservas</h3>
                        <p className="text-sm text-gray-600">Receba confirmações por email e WhatsApp</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Ofertas Especiais</h3>
                        <p className="text-sm text-gray-600">Receba ofertas exclusivas e promoções</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">Lembretes de Viagem</h3>
                        <p className="text-sm text-gray-600">Lembretes sobre check-in e documentos</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações da Conta</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Segurança</h3>
                      <div className="space-y-3">
                        <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">Alterar senha</span>
                            <span className="text-gray-400">{'>'}</span>
                          </div>
                        </button>
                        <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">Autenticação em duas etapas</span>
                            <span className="text-red-600 text-sm">Desativada</span>
                          </div>
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Dados</h3>
                      <div className="space-y-3">
                        <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700">Baixar meus dados</span>
                            <span className="text-gray-400">{'>'}</span>
                          </div>
                        </button>
                        <button className="w-full text-left p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
                          <div className="flex items-center justify-between">
                            <span>Excluir conta</span>
                            <span className="text-red-400">{'>'}</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}