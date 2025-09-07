'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

interface LoginFormData {
  email: string;
  password: string;
}

export default function AdminLoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  
  // Track if component is mounted to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check if user is already logged in with timeout
  useEffect(() => {
    // Only run session check after component is mounted
    if (!isMounted) return;
    
    const checkSession = async (): Promise<void> => {
      try {
        // Add timeout to prevent hanging
        const sessionPromise = getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );
        
        const session = await Promise.race([sessionPromise, timeoutPromise]);
        if (session && typeof session === 'object' && session !== null && 'user' in session && session.user) {
          console.log('✅ [LOGIN] User already logged in, redirecting...');
          router.replace(callbackUrl);
          return;
        }
      } catch (error) {
        console.warn('⚠️ [LOGIN] Session check failed or timed out:', error instanceof Error ? error.message : 'Unknown error');
        // Continue to show login form even if session check fails
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();
  }, [router, callbackUrl, isMounted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    console.log('🔐 Form submetido - Tentativa de login:', {
      email: formData.email,
      password: '***' + formData.password.slice(-3),
      timestamp: new Date().toISOString(),
      formValid: formData.email && formData.password
    });

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log('🔍 Resultado do signIn:', {
        ok: result?.ok,
        error: result?.error,
        status: result?.status,
        url: result?.url
      });

      if (result?.error) {
        console.error('❌ Erro de autenticação:', result.error);
        setError('Credenciais inválidas. Verifique email e senha.');
      } else if (result?.ok) {
        console.log('✅ Login bem-sucedido!');
        console.log('🔄 NextAuth URL de retorno:', result.url);
        
        // Simple redirect without session polling
        console.log('✅ Login bem-sucedido! Redirecionando...');
        setTimeout(() => {
          const targetUrl = callbackUrl.startsWith('/') ? callbackUrl : '/admin';
          router.push(targetUrl);
        }, 1000);
      } else {
        console.error('❌ Resultado inesperado:', result);
        setError('Erro inesperado. Tente novamente.');
      }
    } catch (error) {
      console.error('❌ Erro no processo de login:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      // Ensure loading state is always cleared
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  };

  // Show loading while checking session (only after mounted to prevent hydration mismatch)
  if (!isMounted || isChecking) {
    return (
      <div className="admin-login-container">
        <div className="admin-loading">
          <div className="admin-spinner" style={{ width: '48px', height: '48px' }}></div>
          <p style={{ marginTop: '16px', color: 'var(--admin-text-secondary)' }}>
            {!isMounted ? 'Carregando...' : 'Verificando sessão...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        {/* Main Content */}
        <div className="admin-login-content">
          {/* Logo Section */}
          <div className="admin-login-header">
            <div className="admin-login-logo-container">
              <div className="admin-login-logo-wrapper">
                <svg className="admin-login-logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h1 className="admin-login-title">
              Acesso Administrativo
            </h1>
            <p className="admin-login-subtitle">
              Entre com suas credenciais para acessar o painel admin
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 admin-login-form-card">
            <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
              {/* Error Message */}
              {error && (
                <div className="admin-login-error">
                  <div className="admin-login-error-content">
                    <svg className="admin-login-error-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="admin-login-field">
                <label htmlFor="email" className="admin-label admin-login-label">
                  <svg className="admin-login-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  Email
                </label>
                <div className="admin-login-input-wrapper">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent admin-login-input"
                    placeholder="admin@fly2any.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="admin-login-field">
                <label htmlFor="password" className="admin-label admin-login-label">
                  <svg className="admin-login-field-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Senha
                </label>
                <div className="admin-login-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent admin-login-input"
                    placeholder="Digite sua senha"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="admin-login-button-wrapper">
                <button
                  type="submit"
                  disabled={isLoading || !formData.email || !formData.password}
                  className="admin-btn admin-btn-primary admin-login-button"
                  onClick={(e: React.MouseEvent) => {
                    console.log('🖱️ Botão clicado:', {
                      disabled: isLoading || !formData.email || !formData.password,
                      isLoading,
                      hasEmail: !!formData.email,
                      hasPassword: !!formData.password
                    });
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="admin-spinner admin-login-spinner"></div>
                      <span>Entrando...</span>
                    </>
                  ) : (
                    <>
                      <svg className="admin-login-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Entrar no Sistema</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Development Info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="admin-login-dev-info">
                <div className="admin-login-dev-content">
                  <div className="admin-badge admin-badge-info">
                    <svg className="admin-login-dev-icon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Desenvolvimento
                  </div>
                  <div className="admin-login-dev-credentials">
                    <div className="admin-login-dev-item">
                      <span className="admin-login-dev-key">Email:</span>
                      <code className="admin-login-dev-value">admin@fly2any.com</code>
                    </div>
                    <div className="admin-login-dev-item">
                      <span className="admin-login-dev-key">Senha:</span>
                      <code className="admin-login-dev-value">fly2any2024!</code>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="admin-login-footer">
            <p className="admin-login-footer-text">
              <svg className="admin-login-footer-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              © 2024 Fly2Any. Sistema protegido por autenticação.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}