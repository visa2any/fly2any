'use client';

import React, { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface OptionalLoginProps {
  productType: 'hotel' | 'flight' | 'car' | 'tour' | 'insurance';
  onContinueAsGuest: () => void;
  onLoginSuccess: () => void;
  guestData?: {
    email?: string;
    firstName?: string;
    lastName?: string;
  };
}

export default function OptionalLogin({ 
  productType, 
  onContinueAsGuest, 
  onLoginSuccess,
  guestData 
}: OptionalLoginProps) {
  const { data: session } = useSession();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState(guestData?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, show success state
  if (session) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle size={24} className="text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">Logado com sucesso!</h3>
            <p className="text-green-700">Olá, {session.user?.name}!</p>
          </div>
        </div>
        <p className="text-sm text-green-700 mb-4">
          Seus dados serão preenchidos automaticamente e a reserva será salva na sua conta.
        </p>
        <button
          onClick={onLoginSuccess}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Continuar com {session.user?.name}
        </button>
      </div>
    );
  }

  const getProductName = (type: string) => {
    const names = {
      hotel: 'hotel',
      flight: 'voo',
      car: 'aluguel de carro',
      tour: 'passeio',
      insurance: 'seguro viagem'
    };
    return names[type as keyof typeof names] || 'produto';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha inválidos');
      } else if (result?.ok) {
        onLoginSuccess();
      }
    } catch (err) {
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showLogin) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <User size={24} className="text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">
              Já tem conta na Fly2Any?
            </h3>
            <p className="text-blue-700 text-sm mb-4">
              Faça login para preencher automaticamente seus dados e acompanhar esta reserva de {getProductName(productType)} na sua conta.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowLogin(true)}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Fazer Login
              </button>
              <button
                onClick={onContinueAsGuest}
                className="flex-1 bg-white text-blue-600 py-3 px-4 rounded-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Continuar como Convidado
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-xs text-blue-600">
                ✓ Dados salvos automaticamente • ✓ Histórico de reservas • ✓ Ofertas exclusivas
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Entrar na sua conta
        </h3>
        <button
          onClick={() => setShowLogin(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail size={16} className="text-gray-400" />
            </div>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="seu@email.com"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock size={16} className="text-gray-400" />
            </div>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Sua senha"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff size={16} className="text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye size={16} className="text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="flex-1 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Entrando...
              </div>
            ) : (
              'Entrar'
            )}
          </button>
          
          <button
            type="button"
            onClick={onContinueAsGuest}
            disabled={isLoading}
            className="flex-1 bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Continuar como Convidado
          </button>
        </div>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          Não tem conta?{' '}
          <button
            onClick={onContinueAsGuest}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Continue como convidado
          </button>
          {' '}e crie sua conta depois.
        </p>
      </div>
    </div>
  );
}