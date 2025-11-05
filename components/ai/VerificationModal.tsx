'use client';

import { useState, useEffect, useRef } from 'react';
import { Mail, Phone, Check, X, RefreshCw } from 'lucide-react';

interface VerificationModalProps {
  email: string;
  phone: string;
  userId: string;
  language?: 'en' | 'pt' | 'es';
  onVerified: () => void;
  onClose: () => void;
}

export function VerificationModal({
  email,
  phone,
  userId,
  language = 'en',
  onVerified,
  onClose
}: VerificationModalProps) {
  const [smsCode, setSmsCode] = useState(['', '', '', '', '', '']);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check verification status periodically (for email verification via link)
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/auth/register/check-verification?userId=${userId}`);
        const data = await response.json();

        if (data.success) {
          setEmailVerified(data.emailVerified);
          setPhoneVerified(data.phoneVerified);

          if (data.fullyVerified) {
            clearInterval(checkInterval);
            onVerified();
          }
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    }, 3000); // Check every 3 seconds

    return () => clearInterval(checkInterval);
  }, [userId, onVerified]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...smsCode];
    newCode[index] = value;
    setSmsCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newCode.every(digit => digit !== '') && !phoneVerified) {
      verifySmsCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !smsCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

    const newCode = Array(6).fill('');
    for (let i = 0; i < pastedData.length; i++) {
      newCode[i] = pastedData[i];
    }

    setSmsCode(newCode);

    // Focus last filled input
    if (pastedData.length < 6) {
      inputRefs.current[pastedData.length]?.focus();
    } else {
      verifySmsCode(newCode.join(''));
    }
  };

  const verifySmsCode = async (code: string) => {
    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-sms',
          phone,
          code
        })
      });

      const data = await response.json();

      if (data.success) {
        setPhoneVerified(true);

        // Check if both are verified
        if (emailVerified) {
          setTimeout(() => onVerified(), 1000);
        }
      } else {
        setError(data.error || 'Invalid code');
        // Clear code on error
        setSmsCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('SMS verification error:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const resendSms = async () => {
    if (resendCooldown > 0) return;

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-sms',
          phone,
          language
        })
      });

      const data = await response.json();

      if (data.success) {
        setResendCooldown(60); // 60 second cooldown
        setSmsCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Resend SMS error:', error);
    }
  };

  const labels = {
    en: {
      title: 'Verify Your Account',
      subtitle: 'We sent verification codes to secure your account',
      emailLabel: 'Email Verification',
      emailSent: 'Check your inbox',
      emailVerified: 'Email verified!',
      phoneLabel: 'Phone Verification',
      phoneSent: 'Enter the 6-digit code',
      phoneVerified: 'Phone verified!',
      resend: 'Resend Code',
      resendIn: 'Resend in',
      seconds: 's',
      verifying: 'Verifying...',
      close: 'Close',
      skipForNow: 'Skip for now'
    },
    pt: {
      title: 'Verifique Sua Conta',
      subtitle: 'Enviamos códigos de verificação para proteger sua conta',
      emailLabel: 'Verificação de Email',
      emailSent: 'Verifique sua caixa de entrada',
      emailVerified: 'Email verificado!',
      phoneLabel: 'Verificação de Telefone',
      phoneSent: 'Digite o código de 6 dígitos',
      phoneVerified: 'Telefone verificado!',
      resend: 'Reenviar Código',
      resendIn: 'Reenviar em',
      seconds: 's',
      verifying: 'Verificando...',
      close: 'Fechar',
      skipForNow: 'Pular por enquanto'
    },
    es: {
      title: 'Verifica Tu Cuenta',
      subtitle: 'Enviamos códigos de verificación para asegurar tu cuenta',
      emailLabel: 'Verificación de Email',
      emailSent: 'Revisa tu bandeja de entrada',
      emailVerified: '¡Email verificado!',
      phoneLabel: 'Verificación de Teléfono',
      phoneSent: 'Ingresa el código de 6 dígitos',
      phoneVerified: '¡Teléfono verificado!',
      resend: 'Reenviar Código',
      resendIn: 'Reenviar en',
      seconds: 's',
      verifying: 'Verificando...',
      close: 'Cerrar',
      skipForNow: 'Omitir por ahora'
    }
  }[language];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">{labels.title}</h3>
            <p className="text-[10px] text-gray-600">{labels.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Email Verification */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Mail className={`w-4 h-4 ${emailVerified ? 'text-green-600' : 'text-blue-600'}`} />
              <span className="text-xs font-bold text-gray-900">{labels.emailLabel}</span>
            </div>
            {emailVerified ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <div className="animate-pulse w-4 h-4 rounded-full bg-blue-400" />
            )}
          </div>
          <p className="text-[10px] text-gray-600 ml-6">
            {emailVerified ? labels.emailVerified : labels.emailSent}
          </p>
          {!emailVerified && (
            <p className="text-[9px] text-blue-600 font-semibold ml-6 mt-1">{email}</p>
          )}
        </div>

        {/* Phone Verification */}
        <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Phone className={`w-4 h-4 ${phoneVerified ? 'text-green-600' : 'text-purple-600'}`} />
              <span className="text-xs font-bold text-gray-900">{labels.phoneLabel}</span>
            </div>
            {phoneVerified && <Check className="w-4 h-4 text-green-600" />}
          </div>

          {!phoneVerified && (
            <>
              <p className="text-[10px] text-gray-600 mb-3">{labels.phoneSent}</p>

              {/* 6-Digit Code Input */}
              <div className="flex gap-2 justify-center mb-2" onPaste={handlePaste}>
                {smsCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={phoneVerified || isVerifying}
                    className="w-10 h-12 text-center text-lg font-bold border-2 border-purple-300 rounded-md focus:border-purple-500 focus:ring-2 focus:ring-purple-200 disabled:bg-gray-100"
                  />
                ))}
              </div>

              {error && (
                <p className="text-[10px] text-red-600 text-center mb-2">{error}</p>
              )}

              {isVerifying && (
                <p className="text-[10px] text-purple-600 text-center flex items-center justify-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  {labels.verifying}
                </p>
              )}

              {/* Resend Button */}
              <button
                onClick={resendSms}
                disabled={resendCooldown > 0}
                className="w-full text-[10px] text-purple-600 hover:text-purple-700 font-semibold disabled:text-gray-400 mt-2"
              >
                {resendCooldown > 0
                  ? `${labels.resendIn} ${resendCooldown}${labels.seconds}`
                  : labels.resend}
              </button>
            </>
          )}

          {phoneVerified && (
            <p className="text-[10px] text-green-600 font-semibold">{labels.phoneVerified}</p>
          )}
        </div>

        {/* Skip Button */}
        {!emailVerified || !phoneVerified ? (
          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-gray-600 hover:text-gray-800 font-semibold"
          >
            {labels.skipForNow}
          </button>
        ) : null}
      </div>
    </div>
  );
}
