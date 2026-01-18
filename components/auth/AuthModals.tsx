'use client';

import { useState, useEffect, useRef, createContext, useContext, ReactNode } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Gift,
  Shield,
  Chrome,
  Apple as AppleIcon,
  ArrowRight,
  Check
} from 'lucide-react';
import { useScrollLock } from '@/lib/hooks/useScrollLock';

// ==================== TYPES ====================

type ModalType = 'signup' | 'login' | null;
type Language = 'en' | 'pt' | 'es';

interface AuthModalContextType {
  showSignup: () => void;
  showLogin: () => void;
  closeModal: () => void;
  currentModal: ModalType;
  language: Language;
  setLanguage: (lang: Language) => void;
}

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  rememberMe: boolean;
  acceptTerms: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  acceptTerms?: string;
}

// ==================== TRANSLATIONS ====================

const translations = {
  en: {
    // Common
    email: 'Email Address',
    password: 'Password',
    close: 'Close',
    or: 'or',

    // Signup
    signupTitle: 'Create Your Free Account',
    signupSubtitle: 'Join thousands of smart travelers saving up to 70%',
    firstName: 'First Name',
    lastName: 'Last Name',
    signupButton: 'Create Account',
    signingUp: 'Creating Account...',
    signupWithGoogle: 'Sign up with Google',
    signupWithApple: 'Sign up with Apple',
    haveAccount: 'Already have an account?',
    signInLink: 'Sign In',
    acceptTerms: 'I accept the',
    termsLink: 'Terms of Service',
    and: 'and',
    privacyLink: 'Privacy Policy',
    incentiveTitle: '10% OFF',
    incentiveSubtitle: 'Your First Booking',
    incentiveDetails: 'Exclusive welcome discount for new members',

    // Login
    loginTitle: 'Welcome Back!',
    loginSubtitle: 'Sign in to access exclusive deals and your bookings',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    loginButton: 'Sign In',
    loggingIn: 'Signing In...',
    loginWithGoogle: 'Sign in with Google',
    loginWithApple: 'Sign in with Apple',
    noAccount: "Don't have an account?",
    signUpLink: 'Sign Up',

    // Success
    successTitle: 'Welcome Aboard!',
    successMessage: 'Your account has been created successfully.',
    successLoginMessage: 'Welcome back! Redirecting you...',

    // Validation
    emailRequired: 'Email is required',
    emailInvalid: 'Please enter a valid email address',
    passwordRequired: 'Password is required',
    passwordWeak: 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
    firstNameRequired: 'First name is required',
    lastNameRequired: 'Last name is required',
    termsRequired: 'You must accept the terms and privacy policy',

    // Password strength
    passwordStrength: 'Password Strength',
    weak: 'Weak',
    fair: 'Fair',
    good: 'Good',
    strong: 'Strong',

    // Features
    feature1: 'Access exclusive member-only deals',
    feature2: 'Track your bookings in one place',
    feature3: 'Earn rewards on every purchase',
    feature4: 'Get personalized travel recommendations',
  },
  pt: {
    // Common
    email: 'Endereço de Email',
    password: 'Senha',
    close: 'Fechar',
    or: 'ou',

    // Signup
    signupTitle: 'Crie Sua Conta Grátis',
    signupSubtitle: 'Junte-se a milhares de viajantes inteligentes economizando até 70%',
    firstName: 'Primeiro Nome',
    lastName: 'Sobrenome',
    signupButton: 'Criar Conta',
    signingUp: 'Criando Conta...',
    signupWithGoogle: 'Cadastrar com Google',
    signupWithApple: 'Cadastrar com Apple',
    haveAccount: 'Já tem uma conta?',
    signInLink: 'Entrar',
    acceptTerms: 'Eu aceito os',
    termsLink: 'Termos de Serviço',
    and: 'e a',
    privacyLink: 'Política de Privacidade',
    incentiveTitle: '10% DE DESCONTO',
    incentiveSubtitle: 'Na Sua Primeira Reserva',
    incentiveDetails: 'Desconto exclusivo de boas-vindas para novos membros',

    // Login
    loginTitle: 'Bem-vindo de Volta!',
    loginSubtitle: 'Entre para acessar ofertas exclusivas e suas reservas',
    rememberMe: 'Lembrar-me',
    forgotPassword: 'Esqueceu a senha?',
    loginButton: 'Entrar',
    loggingIn: 'Entrando...',
    loginWithGoogle: 'Entrar com Google',
    loginWithApple: 'Entrar com Apple',
    noAccount: 'Não tem uma conta?',
    signUpLink: 'Cadastre-se',

    // Success
    successTitle: 'Bem-vindo!',
    successMessage: 'Sua conta foi criada com sucesso.',
    successLoginMessage: 'Bem-vindo de volta! Redirecionando...',

    // Validation
    emailRequired: 'Email é obrigatório',
    emailInvalid: 'Por favor insira um email válido',
    passwordRequired: 'Senha é obrigatória',
    passwordWeak: 'Senha deve ter no mínimo 8 caracteres com maiúsculas, minúsculas e números',
    firstNameRequired: 'Primeiro nome é obrigatório',
    lastNameRequired: 'Sobrenome é obrigatório',
    termsRequired: 'Você deve aceitar os termos e política de privacidade',

    // Password strength
    passwordStrength: 'Força da Senha',
    weak: 'Fraca',
    fair: 'Regular',
    good: 'Boa',
    strong: 'Forte',

    // Features
    feature1: 'Acesse ofertas exclusivas para membros',
    feature2: 'Acompanhe suas reservas em um só lugar',
    feature3: 'Ganhe recompensas em cada compra',
    feature4: 'Receba recomendações de viagem personalizadas',
  },
  es: {
    // Common
    email: 'Correo Electrónico',
    password: 'Contraseña',
    close: 'Cerrar',
    or: 'o',

    // Signup
    signupTitle: 'Crea Tu Cuenta Gratis',
    signupSubtitle: 'Únete a miles de viajeros inteligentes ahorrando hasta un 70%',
    firstName: 'Nombre',
    lastName: 'Apellido',
    signupButton: 'Crear Cuenta',
    signingUp: 'Creando Cuenta...',
    signupWithGoogle: 'Registrarse con Google',
    signupWithApple: 'Registrarse con Apple',
    haveAccount: '¿Ya tienes una cuenta?',
    signInLink: 'Iniciar Sesión',
    acceptTerms: 'Acepto los',
    termsLink: 'Términos de Servicio',
    and: 'y la',
    privacyLink: 'Política de Privacidad',
    incentiveTitle: '10% DE DESCUENTO',
    incentiveSubtitle: 'En Tu Primera Reserva',
    incentiveDetails: 'Descuento exclusivo de bienvenida para nuevos miembros',

    // Login
    loginTitle: '¡Bienvenido de Nuevo!',
    loginSubtitle: 'Inicia sesión para acceder a ofertas exclusivas y tus reservas',
    rememberMe: 'Recordarme',
    forgotPassword: '¿Olvidaste tu contraseña?',
    loginButton: 'Iniciar Sesión',
    loggingIn: 'Iniciando Sesión...',
    loginWithGoogle: 'Iniciar sesión con Google',
    loginWithApple: 'Iniciar sesión con Apple',
    noAccount: '¿No tienes una cuenta?',
    signUpLink: 'Regístrate',

    // Success
    successTitle: '¡Bienvenido a Bordo!',
    successMessage: 'Tu cuenta ha sido creada exitosamente.',
    successLoginMessage: '¡Bienvenido de nuevo! Redirigiendo...',

    // Validation
    emailRequired: 'El correo electrónico es requerido',
    emailInvalid: 'Por favor ingresa un correo electrónico válido',
    passwordRequired: 'La contraseña es requerida',
    passwordWeak: 'La contraseña debe tener al menos 8 caracteres con mayúsculas, minúsculas y números',
    firstNameRequired: 'El nombre es requerido',
    lastNameRequired: 'El apellido es requerido',
    termsRequired: 'Debes aceptar los términos y la política de privacidad',

    // Password strength
    passwordStrength: 'Fortaleza de la Contraseña',
    weak: 'Débil',
    fair: 'Regular',
    good: 'Buena',
    strong: 'Fuerte',

    // Features
    feature1: 'Accede a ofertas exclusivas para miembros',
    feature2: 'Rastrea tus reservas en un solo lugar',
    feature3: 'Gana recompensas en cada compra',
    feature4: 'Recibe recomendaciones de viaje personalizadas',
  },
};

// ==================== CONTEXT ====================

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
}

// ==================== PROVIDER ====================

export function AuthModalProvider({
  children,
  defaultLanguage = 'en'
}: {
  children: ReactNode;
  defaultLanguage?: Language;
}) {
  const [currentModal, setCurrentModal] = useState<ModalType>(null);
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  const showSignup = () => setCurrentModal('signup');
  const showLogin = () => setCurrentModal('login');
  const closeModal = () => setCurrentModal(null);

  return (
    <AuthModalContext.Provider
      value={{
        showSignup,
        showLogin,
        closeModal,
        currentModal,
        language,
        setLanguage,
      }}
    >
      {children}
      <AuthModals />
    </AuthModalContext.Provider>
  );
}

// ==================== MAIN COMPONENT ====================

function AuthModals() {
  const { currentModal, closeModal, showLogin, showSignup, language } = useAuthModal();
  const t = translations[language];

  // State
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    rememberMe: false,
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const { lockScroll, unlockScroll } = useScrollLock();

  // Reset form when modal changes
  useEffect(() => {
    if (currentModal) {
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        rememberMe: false,
        acceptTerms: false,
      });
      setErrors({});
      setShowPassword(false);
      setShowSuccess(false);

      // Focus first input
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [currentModal]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentModal) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [currentModal, closeModal]);

  // Centralized scroll lock management (prevents conflicts)
  useEffect(() => {
    if (currentModal) {
      lockScroll();
    } else {
      unlockScroll();
    }
    return () => {
      unlockScroll(); // Guaranteed cleanup
    };
  }, [currentModal, lockScroll, unlockScroll]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = t.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.emailInvalid;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t.passwordRequired;
    } else if (formData.password.length < 8 ||
               !/[A-Z]/.test(formData.password) ||
               !/[a-z]/.test(formData.password) ||
               !/[0-9]/.test(formData.password)) {
      newErrors.password = t.passwordWeak;
    }

    // Signup-specific validation
    if (currentModal === 'signup') {
      if (!formData.firstName) {
        newErrors.firstName = t.firstNameRequired;
      }
      if (!formData.lastName) {
        newErrors.lastName = t.lastNameRequired;
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = t.termsRequired;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Calculate password strength
  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengthMap = {
      0: { label: '', color: '' },
      1: { label: t.weak, color: 'bg-red-500' },
      2: { label: t.weak, color: 'bg-red-500' },
      3: { label: t.fair, color: 'bg-orange-500' },
      4: { label: t.good, color: 'bg-yellow-500' },
      5: { label: t.strong, color: 'bg-green-500' },
      6: { label: t.strong, color: 'bg-green-600' },
    };

    return { score, ...strengthMap[score as keyof typeof strengthMap] };
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call - Replace with actual NextAuth or custom auth
      await new Promise(resolve => setTimeout(resolve, 2000));

      // TODO: Integrate with NextAuth
      // if (currentModal === 'signup') {
      //   await signIn('credentials', { redirect: false, ...formData });
      // } else {
      //   await signIn('credentials', { redirect: false, email: formData.email, password: formData.password });
      // }

      // Track conversion in analytics
      trackAuthConversion(currentModal === 'signup' ? 'signup' : 'login');

      // Show success state
      setShowSuccess(true);

      // Close modal after delay
      setTimeout(() => {
        closeModal();
        // TODO: Redirect or refresh session
      }, 2000);

    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ email: 'Authentication failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle social auth
  const handleSocialAuth = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      // TODO: Integrate with NextAuth
      // await signIn(provider, { callbackUrl: '/' });
      console.log(`Authenticating with ${provider}`);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Track conversion in analytics
      trackAuthConversion(currentModal === 'signup' ? 'signup' : 'login');
    } catch (error) {
      console.error(`${provider} auth error:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Track auth conversions
  const trackAuthConversion = async (type: 'signup' | 'login') => {
    try {
      await fetch('/api/ai/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events: [{
            eventType: type === 'signup' ? 'conversion_signup' : 'conversion_login',
            sessionId: `auth_${Date.now()}`,
            timestamp: new Date().toISOString(),
            isAuthenticated: false,
            metadata: {
              conversionType: type,
            },
          }],
        }),
      });
    } catch (error) {
      // Silently fail - analytics should not block auth
      console.error('Failed to track auth conversion:', error);
    }
  };

  if (!currentModal) return null;

  const passwordStrength = getPasswordStrength(formData.password);
  const isSignup = currentModal === 'signup';

  return (
    <div
      className="fixed inset-0 z-modal-backdrop flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl max-h-[95vh] overflow-hidden bg-white rounded-3xl shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row h-full max-h-[95vh]">
          {/* Left Side - Form */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8 md:p-12">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors z-10"
                aria-label={t.close}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Success State */}
              {showSuccess ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center animate-fadeIn">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 animate-scaleIn">
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {t.successTitle}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {isSignup ? t.successMessage : t.successLoginMessage}
                  </p>
                  <div className="mt-6 flex gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 id="modal-title" className="text-3xl font-bold text-gray-900 font-display">
                          {isSignup ? t.signupTitle : t.loginTitle}
                        </h2>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      {isSignup ? t.signupSubtitle : t.loginSubtitle}
                    </p>
                  </div>

                  {/* Social Auth Buttons */}
                  <div className="space-y-3 mb-6">
                    <button
                      type="button"
                      onClick={() => handleSocialAuth('google')}
                      disabled={isLoading}
                      className="w-full h-12 flex items-center justify-center gap-3 px-6 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl font-semibold text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Chrome className="w-5 h-5 text-[#4285F4]" />
                      {isSignup ? t.signupWithGoogle : t.loginWithGoogle}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSocialAuth('apple')}
                      disabled={isLoading}
                      className="w-full h-12 flex items-center justify-center gap-3 px-6 bg-black hover:bg-gray-900 rounded-xl font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <AppleIcon className="w-5 h-5" />
                      {isSignup ? t.signupWithApple : t.loginWithApple}
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-300" />
                    <span className="text-sm text-gray-500 font-medium">{t.or}</span>
                    <div className="flex-1 h-px bg-gray-300" />
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Fields (Signup Only) */}
                    {isSignup && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                            {t.firstName}
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              ref={firstInputRef}
                              id="firstName"
                              type="text"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              className={`w-full h-12 pl-12 pr-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-primary-500/20 ${
                                errors.firstName
                                  ? 'border-red-500 focus:border-red-500'
                                  : 'border-gray-300 focus:border-primary-500'
                              }`}
                              placeholder="John"
                              disabled={isLoading}
                            />
                          </div>
                          {errors.firstName && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.firstName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                            {t.lastName}
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                              id="lastName"
                              type="text"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              className={`w-full h-12 pl-12 pr-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-primary-500/20 ${
                                errors.lastName
                                  ? 'border-red-500 focus:border-red-500'
                                  : 'border-gray-300 focus:border-primary-500'
                              }`}
                              placeholder="Doe"
                              disabled={isLoading}
                            />
                          </div>
                          {errors.lastName && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.email}
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          ref={!isSignup ? firstInputRef : undefined}
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full h-12 pl-12 pr-4 rounded-xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-primary-500/20 ${
                            errors.email
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:border-primary-500'
                          }`}
                          placeholder="john@example.com"
                          disabled={isLoading}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Password */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                        {t.password}
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className={`w-full h-12 pl-12 pr-12 rounded-xl border-2 transition-all focus:outline-none focus:ring-4 focus:ring-primary-500/20 ${
                            errors.password
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:border-primary-500'
                          }`}
                          placeholder="••••••••"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.password}
                        </p>
                      )}

                      {/* Password Strength Indicator (Signup Only) */}
                      {isSignup && formData.password && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-gray-600">
                              {t.passwordStrength}
                            </span>
                            <span className="text-xs font-semibold text-gray-600">
                              {passwordStrength.label}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Remember Me / Forgot Password */}
                    {!isSignup && (
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            disabled={isLoading}
                          />
                          <span className="text-sm text-gray-700">{t.rememberMe}</span>
                        </label>
                        <button
                          type="button"
                          className="text-sm text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                          disabled={isLoading}
                        >
                          {t.forgotPassword}
                        </button>
                      </div>
                    )}

                    {/* Terms & Privacy (Signup Only) */}
                    {isSignup && (
                      <div>
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.acceptTerms}
                            onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                            className={`w-4 h-4 mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500 ${
                              errors.acceptTerms ? 'border-red-500' : ''
                            }`}
                            disabled={isLoading}
                          />
                          <span className="text-sm text-gray-700">
                            {t.acceptTerms}{' '}
                            <a href="/terms" className="text-primary-600 hover:text-primary-700 font-semibold" target="_blank">
                              {t.termsLink}
                            </a>{' '}
                            {t.and}{' '}
                            <a href="/privacy" className="text-primary-600 hover:text-primary-700 font-semibold" target="_blank">
                              {t.privacyLink}
                            </a>
                          </span>
                        </label>
                        {errors.acceptTerms && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.acceptTerms}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-14 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {isSignup ? t.signingUp : t.loggingIn}
                        </>
                      ) : (
                        <>
                          {isSignup ? t.signupButton : t.loginButton}
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    {/* Switch Modal Link */}
                    <p className="text-center text-sm text-gray-600">
                      {isSignup ? t.haveAccount : t.noAccount}{' '}
                      <button
                        type="button"
                        onClick={isSignup ? showLogin : showSignup}
                        className="text-primary-600 hover:text-primary-700 font-bold transition-colors"
                        disabled={isLoading}
                      >
                        {isSignup ? t.signInLink : t.signUpLink}
                      </button>
                    </p>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* Right Side - Benefits & Incentive */}
          <div className="hidden md:block w-[480px] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 text-white relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 h-full flex flex-col">
              {/* Incentive Badge */}
              {isSignup && (
                <div className="mb-8 p-6 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl shadow-2xl transform hover:scale-105 transition-transform">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold mb-1">{t.incentiveTitle}</div>
                      <div className="text-lg font-semibold mb-2">{t.incentiveSubtitle}</div>
                      <div className="text-sm text-white/90">{t.incentiveDetails}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Features List */}
              <div className="flex-1 space-y-6">
                <h3 className="text-2xl font-bold mb-6">
                  {isSignup ? 'Join Thousands of Happy Travelers' : 'Welcome Back to Fly2Any'}
                </h3>

                {[t.feature1, t.feature2, t.feature3, t.feature4].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 group"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-white/20 transition-colors">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-white/90 text-base leading-relaxed pt-2">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>

              {/* Trust Badge */}
              <div className="mt-8 flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <Shield className="w-8 h-8 text-white flex-shrink-0" />
                <div className="text-sm text-white/90">
                  <div className="font-bold mb-1">Secure & Private</div>
                  <div>Your data is encrypted and protected with industry-leading security</div>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">500K+</div>
                  <div className="text-xs text-white/80">Happy Travelers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">$50M+</div>
                  <div className="text-xs text-white/80">Saved Together</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">4.9/5</div>
                  <div className="text-xs text-white/80">User Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== EXPORTS ====================

export default AuthModals;
