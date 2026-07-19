"use client";

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Email address is required');
      return;
    }
    setLoading(true);
    // Dummy request for now
    setTimeout(() => {
      toast.success('If an account exists with this email, a reset link has been sent.');
      setLoading(false);
    }, 1500);
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
              Securing your account.
            </h1>
            <p className="text-slate-655 text-base leading-relaxed font-medium">
              Recover your access using email authentication and keep your digital assets safe.
            </p>
            <p className="text-slate-400 text-xs font-semibold tracking-wide uppercase pt-1">
              A verification link will be sent to your inbox.
            </p>
          </div>
        </div>

        {/* Bottom Logo or empty space */}
        <div className="relative z-10 text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} ORVIXPAY. All rights reserved.
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
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reset Password</h2>
            <p className="text-sm text-slate-500 mt-2 font-medium">We'll send you a link to reset it.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <input 
                type="email" 
                autoComplete="off"
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
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Sending Link...</>
              ) : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Remember your password? <Link href="/login" className="text-slate-900 hover:text-purple-600 transition-colors">Log in here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
