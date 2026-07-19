"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '', businessName: '' });
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [otpCode, setOtpCode] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step === 'credentials') {
      if (!formData.businessName.trim()) {
        toast.error('Business name is required');
        return;
      }
      if (!formData.email.trim()) {
        toast.error('Email address is required');
        return;
      }
      if (!formData.password.trim()) {
        toast.error('Password is required');
        return;
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;<>,.?/~\\-]).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        toast.error('Password must contain at least 8 characters, 1 uppercase letter, 1 number, and 1 special character');
        return;
      }

      setLoading(true);

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();

        if (data.success && data.emailOtpRequired) {
          setStep('otp');
          setOtpCode('');
          setResendCooldown(60);
          toast.success('A verification code has been sent to your email.');
        } else {
          toast.error(data.error || 'Registration failed');
        }
      } catch (err) {
        toast.error('An error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      if (!otpCode.trim()) {
        toast.error('Verification code is required');
        return;
      }
      if (otpCode.length !== 6) {
        toast.error('Verification code must be exactly 6 digits');
        return;
      }

      setLoading(true);

      try {
        const res = await fetch('/api/auth/register/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, code: otpCode })
        });
        const data = await res.json();

        if (data.success) {
          toast.success('Email verified! Redirecting to dashboard...');
          await checkAuth();
          router.push('/dashboard');
        } else {
          toast.error(data.error || 'Verification failed');
        }
      } catch (err) {
        toast.error('An error occurred during verification.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResendOtp = async () => {
    setSendingEmail(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success && data.emailOtpRequired) {
        toast.success('A new verification code has been sent to your email.');
        setOtpCode('');
        setResendCooldown(60);
      } else {
        toast.error(data.error || 'Failed to resend code');
      }
    } catch {
      toast.error('Failed to resend. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white font-sans">
      
      {/* Left side: Premium Features Panel (Light Mode Style) */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-purple-50/50 via-slate-50 to-indigo-50/50 p-12 flex-col justify-between relative overflow-hidden select-none border-r border-slate-100">
        {/* Glow Effects */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-purple-200/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-200/25 blur-[100px] pointer-events-none" />
        
        {/* Texture Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60 pointer-events-none z-0" />
        
        {/* Top: Logo */}
        <div className="flex items-center gap-3 relative z-10 pl-4">
          <img src="/logo.PNG" alt="ORVIXPAY" className="h-10 object-contain" />
        </div>

        {/* Center Content: Clean and Minimal Branding */}
        <div className="my-auto relative z-10 max-w-sm space-y-6 pl-4">
          <div className="w-12 h-1 bg-gradient-to-r from-purple-600 to-indigo-655 rounded-full" />
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold text-indigo-950 tracking-tight leading-tight">
              Accept Crypto Payments.
            </h1>
            <p className="text-slate-655 text-base leading-relaxed font-medium">
              Sign up in seconds to start sending professional crypto invoices and receive stablecoins directly.
            </p>
            <p className="text-slate-400 text-xs font-semibold tracking-wide uppercase pt-1">
              Receive payouts instantly into your personal wallet.
            </p>
          </div>
        </div>

        {/* Bottom Logo or empty space */}
        <div className="relative z-10 text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} ORVIXPAY. All rights reserved.
        </div>
      </div>

      {/* Right side: Register Form Panel (Flat Layout) */}
      <div className="lg:col-span-7 flex flex-col items-center justify-center p-8 md:p-16 bg-slate-50 lg:bg-white relative overflow-hidden">
        {/* Ambient background glow for mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-100/10 blur-[100px] rounded-full pointer-events-none lg:hidden"></div>

        <div className="max-w-[360px] w-full relative z-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <img src="/logo.PNG" alt="ORVIXPAY" className="h-10 mx-auto mb-4 object-contain lg:hidden" />
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {step === 'credentials' ? 'Create Account' : 'Verify Email'}
            </h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              {step === 'credentials' 
                ? 'Join us to start processing crypto payments' 
                : `We sent a code to ${formData.email}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 'credentials' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Business Name</label>
                  <input 
                    type="text" 
                    autoComplete="off"
                    placeholder="Merchant Inc."
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400" 
                    value={formData.businessName} 
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                  <input 
                    type="email" 
                    autoComplete="off"
                    placeholder="name@company.com"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-255 pr-12 transition-all outline-none font-medium text-slate-900 placeholder:text-slate-400" 
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})} 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 font-medium">Must be 8+ chars with uppercase, number, and special character.</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-widest mb-2.5">Verification Code</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="123456" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-600 transition-all outline-none font-mono text-center text-lg tracking-[8px] text-slate-800 font-bold placeholder:text-slate-350"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  />
                  <p className="text-[10px] text-slate-400 mt-3 font-semibold text-center leading-normal">
                    Enter the 6-digit confirmation code.
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    type="button" 
                    disabled={resendCooldown > 0 || sendingEmail}
                    onClick={handleResendOtp}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 disabled:text-slate-400 transition"
                  >
                    {sendingEmail ? 'Sending...' : resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Verification Code'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setStep('credentials')}
                    className="text-xs font-semibold text-slate-450 hover:text-slate-600 transition"
                  >
                    Edit Registration Details
                  </button>
                </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3.5 mt-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all disabled:bg-slate-300 disabled:text-slate-500 font-bold shadow-md shadow-purple-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Processing...</>
              ) : step === 'credentials' ? 'Register' : 'Verify Code'}
            </button>
          </form>

          {step === 'credentials' && (
            <div className="mt-8 text-center text-sm font-medium text-slate-500">
              Already have an account? <Link href="/login" className="text-slate-900 hover:text-purple-600 transition-colors">Log in here</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
