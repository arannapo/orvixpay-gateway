"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuth } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });

  // Steps:
  // 'credentials'  — email + password
  // 'email-otp'    — email OTP required (no 2FA users — mandatory)
  // 'totp'         — authenticator code (2FA users)
  // 'totp-email'   — email OTP fallback (2FA users who lost authenticator)
  // const [step, setStep] = useState('credentials');
  const [step, setStep] = useState('credentials');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      toast.success(language === 'es' ? 'Cuenta creada con éxito. Por favor inicia sesión.' : 'Account created successfully. Please login.');
    }
  }, [searchParams, language]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 'credentials') {
      if (!formData.email.trim()) {
        toast.error(language === 'es' ? 'El correo electrónico es requerido' : 'Email address is required');
        return;
      }
      if (!formData.password.trim()) {
        toast.error(language === 'es' ? 'La contraseña es requerida' : 'Password is required');
        return;
      }
    } else {
      if (!otpCode.trim()) {
        toast.error(language === 'es' ? 'El código de verificación es requerido' : 'Verification code is required');
        return;
      }
      if (otpCode.length !== 6) {
        toast.error(language === 'es' ? 'El código debe tener exactamente 6 dígitos' : 'Verification code must be exactly 6 digits');
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, code: otpCode || undefined })
      });
      const data = await res.json();

      if (data.success) {
        if (data.twoFactorRequired) {
          setStep('totp');
          setOtpCode('');
          setLoading(false);
          return;
        }
        if (data.emailOtpRequired) {
          setStep('email-otp');
          setOtpCode('');
          toast.success(language === 'es' ? 'Se ha enviado un código de verificación a su correo.' : 'A verification code has been sent to your email address.');
          setResendCooldown(60);
          setLoading(false);
          return;
        }
        await checkAuth();
      } else {
        if (data.error === 'email_not_verified') {
          toast.success(language === 'es' ? 'Cuenta no verificada. Redirigiendo a verificación OTP...' : 'Account not verified. Redirecting to OTP verification...');
          setTimeout(() => {
            router.push(`/register?email=${encodeURIComponent(formData.email)}&step=otp`);
          }, 1500);
          return;
        }
        toast.error(data.error || (language === 'es' ? 'Error al iniciar sesión' : 'Login failed'));
      }
    } catch {
      toast.error(language === 'es' ? 'Ocurrió un error. Compruebe su conexión.' : 'An error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP for non-2FA users (re-calls login with credentials only)
  const handleResendOtp = async () => {
    setSendingEmail(true);
    setError('');
    setMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (data.success && data.emailOtpRequired) {
        toast.success(language === 'es' ? 'Se ha enviado un nuevo código a su correo.' : 'A new verification code has been sent to your email.');
        setOtpCode('');
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

  // Send email OTP for 2FA users who don't have their authenticator
  const handleSendTotpEmailFallback = async () => {
    setSendingEmail(true);
    setError('');
    try {
      const res = await fetch('/api/auth/2fa/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const data = await res.json();
      if (data.success) {
        setStep('totp-email');
        setOtpCode('');
        toast.success(language === 'es' ? 'Se ha enviado un código de verificación a su correo.' : 'A verification code has been sent to your email address.');
        setResendCooldown(60);
      } else {
        toast.error(data.error || (language === 'es' ? 'Error al enviar código de correo' : 'Failed to send email code'));
      }
    } catch {
      toast.error(language === 'es' ? 'Error al enviar correo. Intente de nuevo.' : 'Failed to send email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  const is2FAStep = step === 'totp' || step === 'totp-email' || step === 'email-otp';

  const maskedEmail = formData.email
    ? formData.email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 6)) + c)
    : '';

  const headings = {
    credentials: { title: t('authCredentialsTitle'), subtitle: t('authCredentialsSub') },
    'email-otp':  { title: t('authEmailOtpTitle'), subtitle: `${t('authEmailOtpSub')} ${maskedEmail}` },
    totp:         { title: t('authTotpTitle'), subtitle: t('authTotpSub') },
    'totp-email': { title: t('authEmailOtpTitle'), subtitle: `${t('authEmailOtpSub')} ${maskedEmail}` },
  };

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
        <Link href="/" className="flex items-center gap-3 relative z-10 pl-4 cursor-pointer">
          <img src="/logo.PNG" alt="ORVIXPAY" className="h-10 object-contain" />
        </Link>

        {/* Center Content: Clean and Minimal Branding */}
        <div className="my-auto relative z-10 max-w-sm space-y-6 pl-4">
          <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-indigo-655 rounded-full" />
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold text-indigo-950 tracking-tight leading-tight">
              {t("authWelcomeBack")}
            </h1>
            <p className="text-slate-655 text-base leading-relaxed font-medium">
              {t("authLoginDesc")}
            </p>
            <p className="text-slate-400 text-xs font-semibold tracking-wide uppercase pt-1">
              {t("authNonCustodial")}
            </p>
          </div>
        </div>

        {/* Bottom Logo or empty space */}
        <div className="relative z-10 text-xs text-slate-450 font-bold uppercase tracking-wider">
          &copy; {new Date().getFullYear()} ORVIXPAY. All rights reserved.
        </div>
      </div>

      {/* Right side: Login Form Panel (Flat Layout) */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 md:p-16 bg-slate-50 lg:bg-white relative overflow-hidden">
        {/* Ambient background glow for mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-100/10 blur-[100px] rounded-full pointer-events-none lg:hidden"></div>

        <div className="max-w-[360px] w-full relative z-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/">
              <img src="/logo.PNG" alt="ORVIXPAY" className="h-10 mx-auto mb-4 object-contain lg:hidden cursor-pointer" />
            </Link>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{headings[step]?.title}</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">{headings[step]?.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── Credentials step ── */}
            {step === 'credentials' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{t("authEmailAddr")}</label>
                  <input
                    type="email" autoComplete="off"
                    placeholder="name@company.com"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">{t("authPass")}</label>
                    <Link href="/forgot-password" className="text-xs font-bold text-purple-600 hover:text-purple-700 transition-colors">{t("authForgotPass")}</Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"} autoComplete="off"
                      placeholder="••••••••"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-255 pr-12 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors">
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── Email OTP step (no-2FA mandatory verification) ── */}
            {step === 'email-otp' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">{t("authVerifyCode")}</label>
                  <input
                    type="text" maxLength={6} pattern="[0-9]{6}" autoFocus
                    placeholder="000000"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-bold text-center text-2xl tracking-[0.4em] text-slate-900 placeholder:text-slate-300 font-mono"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  />
                  <p className="text-center text-xs text-slate-400 mt-2 font-medium">{t("authCodeExpiry")}</p>
                </div>

                {/* Resend button */}
                <button type="button" disabled={sendingEmail || resendCooldown > 0} onClick={handleResendOtp}
                  className="w-full py-2.5 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-55 transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50">
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
              </div>
            )}

            {/* ── TOTP / Authenticator step ── */}
            {step === 'totp' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">{t("authAuthenticatorCode")}</label>
                  <input
                    type="text" maxLength={6} pattern="[0-9]{6}" autoFocus
                    placeholder="000000"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-bold text-center text-2xl tracking-[0.4em] text-slate-900 placeholder:text-slate-300 font-mono"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  />
                  <p className="text-center text-xs text-slate-400 mt-2 font-medium">{t("authAuthenticatorAppSub")}</p>
                </div>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{language === 'es' ? 'o' : 'or'}</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button type="button" disabled={sendingEmail} onClick={handleSendTotpEmailFallback}
                  className="w-full py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {sendingEmail ? (
                    <><span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span> {language === 'es' ? 'Enviando...' : 'Sending...'}</>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      {t("authSendEmailFallback")}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ── Email fallback for TOTP users ── */}
            {step === 'totp-email' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">{t("authVerifyCode")}</label>
                  <input
                    type="text" maxLength={6} pattern="[0-9]{6}" autoFocus
                    placeholder="000000"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-bold text-center text-2xl tracking-[0.4em] text-slate-900 placeholder:text-slate-300 font-mono"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  />
                  <p className="text-center text-xs text-slate-400 mt-2 font-medium">{t("authCodeExpiry")}</p>
                </div>

                <div className="relative flex items-center py-1">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink-0 mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{language === 'es' ? 'o' : 'or'}</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button type="button" onClick={() => { setStep('totp'); setOtpCode(''); setError(''); setMsg(''); }}
                  className="w-full py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-semibold text-sm flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  {t("authUseAuthenticator")}
                </button>
              </div>
            )}

            {/* Submit button */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 mt-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all disabled:bg-slate-300 disabled:text-slate-500 font-bold shadow-md shadow-purple-100 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  {step === 'credentials' ? t("authSigningIn") : t("authVerifying")}</>
              ) : step === 'credentials' ? t("authSignIn") : t("authVerifyBtn")}
            </button>

            {/* Google login temporarily hidden */}

            {/* Back to credentials on any verification step */}
            {is2FAStep && (
              <button type="button"
                onClick={() => { setStep('credentials'); setOtpCode(''); setError(''); setMsg(''); }}
                className="w-full text-center text-xs text-slate-450 hover:text-slate-700 font-bold uppercase tracking-wider pt-1">
                {t("authBackToLogin")}
              </button>
            )}
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            {t("authNoAccount")} <Link href="/register" className="text-slate-900 hover:text-purple-600 transition-colors font-bold">{t("authRegisterHere")}</Link>
          </div>

          <div className="text-center mt-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-purple-600 transition">
              ← {language === 'es' ? 'Volver al Inicio' : 'Back to Home'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
