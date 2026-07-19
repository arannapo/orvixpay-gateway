"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(language === 'es' ? 'El correo electrónico es requerido' : 'Email address is required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (data.success) {
        toast.success(language === 'es' ? 'Se ha enviado un código de restablecimiento a su correo.' : 'A reset OTP has been sent to your email.');
        setStep('reset');
        setResendCooldown(60);
      } else {
        toast.error(data.error || (language === 'es' ? 'Error al solicitar el código' : 'Failed to request reset OTP'));
      }
    } catch {
      toast.error(language === 'es' ? 'Ocurrió un error. Inténtelo de nuevo.' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error(language === 'es' ? 'El código de verificación es requerido' : 'Verification code is required');
      return;
    }
    if (!password.trim()) {
      toast.error(language === 'es' ? 'La contraseña es requerida' : 'Password is required');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;<>,.?/~\\-]).{8,}$/;
    if (!passwordRegex.test(password)) {
      toast.error(
        language === 'es' 
          ? 'La contraseña debe contener al menos 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial' 
          : 'Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, password })
      });
      const data = await res.json();

      if (data.success) {
        toast.success(t('authPassChangedSuccess'));
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        toast.error(data.error || (language === 'es' ? 'Error al actualizar la contraseña' : 'Failed to reset password'));
      }
    } catch {
      toast.error(language === 'es' ? 'Ocurrió un error. Inténtelo de nuevo.' : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setSendingEmail(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(language === 'es' ? 'Se ha enviado un nuevo código a su correo.' : 'A new verification code has been sent to your email.');
        setCode('');
        setResendCooldown(60);
      } else {
        toast.error(data.error || (language === 'es' ? 'Error al reenviar código' : 'Failed to resend code'));
      }
    } catch {
      toast.error(language === 'es' ? 'No se pudo reenviar. Inténtelo de nuevo.' : 'Failed to resend. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 6)) + c)
    : '';

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white font-sans relative">
      
      {/* Absolute Language Switcher */}
      <div className="absolute top-6 right-6 z-30">
        <LanguageSwitcher />
      </div>

      {/* Left side: Premium Features Panel (Light Mode Style) */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-purple-50/50 via-slate-50 to-indigo-50/50 p-12 flex-col justify-between relative overflow-hidden select-none border-r border-slate-100">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-purple-200/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-200/25 blur-[100px] pointer-events-none" />
        
        {/* Texture Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MCAwIEwgMCAwIDAgNDApIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMCwwLDAsMC4wMikiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4n)] opacity-85 pointer-events-none z-0" />
        
        {/* Top: Logo */}
        <div className="flex items-center gap-3 relative z-10 pl-4">
          <img src="/logo.PNG" alt="ORVIXPAY" className="h-10 object-contain" />
        </div>

        {/* Center Content: Clean and Minimal Branding */}
        <div className="my-auto relative z-10 max-w-sm space-y-6 pl-4">
          <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-indigo-655 rounded-full" />
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold text-indigo-950 tracking-tight leading-tight">
              {language === 'es' ? 'Asegurando tu cuenta.' : 'Securing your account.'}
            </h1>
            <p className="text-slate-655 text-base leading-relaxed font-medium">
              {language === 'es' 
                ? 'Recupere su acceso usando la verificación de correo electrónico y mantenga seguros sus activos digitales.' 
                : 'Recover your access using email authentication and keep your digital assets safe.'}
            </p>
            <p className="text-slate-400 text-xs font-semibold tracking-wide uppercase pt-1">
              {language === 'es' ? 'Se enviará un enlace de verificación a su bandeja.' : 'A verification link will be sent to your inbox.'}
            </p>
          </div>
        </div>

        {/* Bottom Logo or empty space */}
        <div className="relative z-10 text-xs text-slate-455 font-bold uppercase tracking-wider">
          &copy; {new Date().getFullYear()} ORVIXPAY. All rights reserved.
        </div>
      </div>

      {/* Right side: Forgot Password Panel (Flat Layout) */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 md:p-16 bg-slate-50 lg:bg-white relative overflow-hidden">
        {/* Ambient background glow for mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-100/10 blur-[100px] rounded-full pointer-events-none lg:hidden"></div>

        <div className="max-w-[360px] w-full relative z-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <img src="/logo.PNG" alt="ORVIXPAY" className="h-10 mx-auto mb-4 object-contain lg:hidden" />
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {step === 'request' ? t("authForgotTitle") : t("authEmailOtpTitle")}
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              {step === 'request' ? t("authForgotSub") : `${t("authEmailOtpSub")} ${maskedEmail}`}
            </p>
          </div>

          {step === 'request' ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t("authEmailAddr")}</label>
                <input 
                  type="email" 
                  autoComplete="off" required
                  placeholder="name@company.com"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-3.5 mt-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all disabled:bg-slate-300 disabled:text-slate-500 font-bold shadow-md shadow-purple-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> {language === 'es' ? 'Enviando...' : 'Sending OTP...'}</>
                ) : t("authSendOtpBtn")}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t("authVerifyCode")}</label>
                <input 
                  type="text" maxLength={6} pattern="[0-9]{6}" required autoFocus
                  placeholder="000000"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-bold text-center text-2xl tracking-[0.4em] text-slate-900 placeholder:text-slate-300 font-mono" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} 
                />
                <p className="text-center text-xs text-slate-400 mt-2 font-medium">{t("authCodeExpiry")}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t("authNewPassLabel")}</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} required
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-255 pr-12 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 focus:outline-none transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Resend button */}
              <button type="button" disabled={sendingEmail || resendCooldown > 0} onClick={handleResendOtp}
                className="w-full py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50">
                {sendingEmail ? (
                  <><span className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span> {language === 'es' ? 'Enviando...' : 'Sending...'}</>
                ) : resendCooldown > 0 ? (
                  `${t("authResendCooldown")} ${resendCooldown}s`
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
                    {t("authResendBtn")}
                  </>
                )}
              </button>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-3.5 mt-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all disabled:bg-slate-300 disabled:text-slate-500 font-bold shadow-md shadow-purple-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> {t("authResetLoading")}</>
                ) : t("authResetBtn")}
              </button>

              <button type="button"
                onClick={() => { setStep('request'); setCode(''); setPassword(''); }}
                className="w-full text-center text-xs text-slate-450 hover:text-slate-700 font-bold uppercase tracking-wider pt-1">
                ← {language === 'es' ? 'Volver' : 'Back'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            {language === 'es' ? '¿Recuerda su contraseña?' : 'Remember your password?'} <Link href="/login" className="text-slate-900 hover:text-purple-600 transition-colors font-bold">{t("authLoginHere")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
