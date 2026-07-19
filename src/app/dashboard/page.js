"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DollarSign, ChevronDown, Sparkles, CheckCircle2, Circle, HelpCircle } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';


export default function DashboardPage() {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    apiRequests: 0,
    systemWalletAddress: null,
    systemWalletBalance: '0.0000'
  });
  const [profile, setProfile] = useState(null);
  const [allInvoices, setAllInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [chartFilter, setChartFilter] = useState('7days');
  const [showChartDropdown, setShowChartDropdown] = useState(false);
  const [chartStatus, setChartStatus] = useState('Paid');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const handleCopy = () => {
    if (stats.systemWalletAddress) {
      navigator.clipboard.writeText(stats.systemWalletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, listRes, settingsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/invoice/list'),
        fetch('/api/user/settings')
      ]);
      const statsData = await statsRes.json();
      const listData = await listRes.json();
      const settingsData = await settingsRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }
      if (listData.success) {
        setAllInvoices(listData.invoices || []);
      }
      if (settingsData.success && settingsData.user) {
        setProfile(settingsData.user);
      }
    } catch (error) {
      console.error('Error fetching stats and invoices', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Paid') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (status === 'Pending') return 'bg-slate-50 text-slate-600 border border-slate-250/60';
    if (status === 'Processing') return 'bg-blue-50 text-blue-700 border border-blue-100';
    if (status === 'Partially Paid') return 'bg-amber-50 text-amber-700 border border-amber-100';
    if (status === 'Overpaid') return 'bg-purple-50 text-purple-700 border border-purple-100';
    if (status === 'Gas Funding') return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
    if (status === 'Expired') return 'bg-rose-50 text-rose-700 border border-rose-100';
    return 'bg-slate-50 text-slate-700 border border-slate-200';
  };

  if (loading) {
    return (
      <div className="space-y-8 pb-10 animate-pulse">
        {/* Top Cards Skeleton (2 cards: Setup & Gas Wallet) */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-[260px] bg-slate-200/60 rounded-2xl"></div>
          <div className="h-[260px] bg-slate-200/60 rounded-2xl"></div>
        </div>

        {/* 4 Stat Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[100px] bg-slate-200/60 rounded-2xl"></div>
          ))}
        </div>

        {/* Bottom Chart Skeleton */}
        <div className="mt-12">
          <div className="h-[340px] bg-slate-200/60 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  const bnbBalance = parseFloat(stats.systemWalletBalance || 0);
  const avgGasPerTx = 0.0002; // Average BNB fee for BEP20 token transfer
  const estimatedTxs = Math.floor(bnbBalance / avgGasPerTx);
  const minRecommended = 0.01; // Recommended minimum balance (enough for ~50 sweeps)

  const getGraphData = () => {
    const data = [];
    const now = new Date();

    const matchesStatus = (inv) => chartStatus === 'All' || inv.status === chartStatus;

    if (chartFilter === '7days') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const revenue = allInvoices
          .filter(inv => matchesStatus(inv) && new Date(inv.createdAt).toDateString() === d.toDateString())
          .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
        
        // Add actual revenue exclusively
        data.push({ date: dateStr, revenue: revenue });
      }
    } else if (chartFilter === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const start = new Date();
        start.setDate(now.getDate() - (i + 1) * 7);
        const end = new Date();
        end.setDate(now.getDate() - i * 7);
        
        const label = `Week ${4 - i}`;
        const revenue = allInvoices
          .filter(inv => {
            if (!matchesStatus(inv)) return false;
            const invDate = new Date(inv.createdAt);
            return invDate >= start && invDate < end;
          })
          .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
        
        data.push({ date: label, revenue: revenue });
      }
    } else if (chartFilter === 'monthly') {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(now.getMonth() - i);
        const label = d.toLocaleDateString([], { month: 'short' });
        
        const revenue = allInvoices
          .filter(inv => {
            if (!matchesStatus(inv)) return false;
            const invDate = new Date(inv.createdAt);
            return invDate.getMonth() === d.getMonth() && invDate.getFullYear() === d.getFullYear();
          })
          .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
        
        data.push({ date: label, revenue: revenue });
      }
    } else if (chartFilter === 'yearly') {
      // Last 3 years
      for (let i = 2; i >= 0; i--) {
        const year = now.getFullYear() - i;
        const label = `${year}`;
        
        const revenue = allInvoices
          .filter(inv => {
            if (!matchesStatus(inv)) return false;
            const invDate = new Date(inv.createdAt);
            return invDate.getFullYear() === year;
          })
          .reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
        
        data.push({ date: label, revenue: revenue });
      }
    }

    return data;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* ── Top 3-column grid ── */}
      {(() => {
        const bnbBal = parseFloat(stats.systemWalletBalance || 0);
        const checks = profile ? [
          { key: 'logo',     label: language === 'es' ? 'Logotipo de empresa' : 'Business logo',           done: !!profile.logo,              href: '/dashboard/settings' },
          { key: 'wallet',   label: language === 'es' ? 'Billetera de liquidación' : 'Receiving wallet',        done: !!profile.merchantWallet,    href: '/dashboard/settings' },
          { key: 'balance',  label: language === 'es' ? 'Fondear gas del sistema' : 'Fund system wallet',      done: bnbBal >= 0.01,              href: '/dashboard' },
          { key: 'business', label: language === 'es' ? 'Nombre de la empresa' : 'Business name',           done: !!profile.businessName,      href: '/dashboard/settings' },
          { key: 'website',  label: language === 'es' ? 'URL de sitio web' : 'Website URL',             done: !!profile.website,           href: '/dashboard/settings' },
          { key: '2fa',      label: language === 'es' ? 'Autenticación 2FA' : 'Two-factor auth',         done: !!profile.twoFactorEnabled,  href: '/dashboard/settings' },
        ] : [];

        const completed = checks.filter(c => c.done).length;
        const total = checks.length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
        const allDone = pct === 100;

        // SVG circular ring maths
        const radius = 44;
        const circ = 2 * Math.PI * radius;
        const dash = (pct / 100) * circ;
        const ringColor = pct < 40 ? '#f43f5e' : pct < 75 ? '#f59e0b' : '#10b981';

        return (
          <div className={`grid grid-cols-1 gap-6 ${stats.systemWalletAddress && !allDone ? 'xl:grid-cols-2' : 'xl:grid-cols-1'}`}>

            {/* ── Card 1: Account Setup ── */}
            {!allDone && profile && (() => {
              const checkInfos = [
                { key: 'logo',     label: language === 'es' ? 'Logotipo de empresa' : 'Business logo',           done: !!profile.logo,              href: '/dashboard/settings', tooltip: language === 'es' ? 'Sube el logotipo de tu empresa para mostrarlo en las facturas. Configura esto en la pestaña Cuenta.' : 'Upload your company logo to display on invoices. Set this in Settings under the Account tab.' },
                { key: 'wallet',   label: language === 'es' ? 'Billetera de liquidación' : 'Receiving wallet',        done: !!profile.merchantWallet,    href: '/dashboard/settings', tooltip: language === 'es' ? 'Especifica tu dirección personal de recepción BEP20/BSC. Configura esto en la pestaña Cuenta.' : 'Specify your personal BEP20/BSC receiving address. Set this in Settings under the Account tab.' },
                { key: 'balance',  label: language === 'es' ? 'Fondear gas del sistema' : 'Fund system wallet',      done: bnbBal >= 0.01,              href: '/dashboard', tooltip: language === 'es' ? 'Deposita BNB usando la tarjeta de Billetera de Gas del Sistema que se muestra en el panel.' : 'Deposit BNB using the System Gas Wallet card shown on the dashboard.' },
                { key: 'business', label: language === 'es' ? 'Nombre de la empresa' : 'Business name',           done: !!profile.businessName,      href: '/dashboard/settings', tooltip: language === 'es' ? 'Ingresa el nombre oficial de tu empresa para la personalización de facturas. Configura esto en la pestaña Cuenta.' : 'Enter your official business name for invoice branding. Set this in Settings under the Account tab.' },
                { key: 'website',  label: language === 'es' ? 'URL de sitio web' : 'Website URL',             done: !!profile.website,           href: '/dashboard/settings', tooltip: language === 'es' ? 'Proporciona la URL principal de tu sitio web. Configura esto en la pestaña Cuenta.' : 'Provide your main website URL. Set this in Settings under the Account tab.' },
                { key: '2fa',      label: language === 'es' ? 'Autenticación 2FA' : 'Two-factor auth',         done: !!profile.twoFactorEnabled,  href: '/dashboard/settings', tooltip: language === 'es' ? 'Protege tus inicios de sesión con 2FA. Activa esto en la pestaña Seguridad.' : 'Secure your logins with 2FA. Enable this in Settings under the Security tab.' },
              ];

              return (
                <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col p-6 relative">
                  {/* Decorative faint glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-100/30 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-2 z-10">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-violet-500" />
                      <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">{language === 'es' ? 'Completa tu Perfil' : 'Complete Your Profile'}</h3>
                    </div>
                    <span className="text-xs font-bold bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full">{pct}% {language === 'es' ? 'Completado' : 'Complete'}</span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium mb-4 z-10">
                    {language === 'es' ? 'Configura los detalles de tu perfil comercial para comenzar a procesar transacciones.' : 'Configure your merchant profile details to begin processing live stablecoin transactions.'}
                  </p>

                  {/* Horizontal progress bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-6 z-10 relative">
                    <div
                      className="h-full transition-all duration-700 ease-out rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #6366f1, #a855f7)'
                      }}
                    />
                  </div>

                  {/* Checklist grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 z-10">
                    {checkInfos.map((c) => (
                      <div key={c.key} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        c.done 
                          ? 'bg-slate-50/50 border-slate-100/80 text-slate-500' 
                          : 'bg-white border-slate-200/60 hover:border-slate-300 hover:shadow-sm text-slate-700'
                      }`}>
                        <Link
                          href={c.href}
                          className={`flex items-center gap-3 flex-1 ${c.done ? 'pointer-events-none' : ''}`}
                        >
                          {c.done ? (
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                          ) : (
                            <Circle size={16} className="text-slate-300 hover:text-violet-500 shrink-0" />
                          )}
                          <span className={`text-xs font-semibold ${c.done ? 'line-through text-slate-400 font-medium' : 'text-slate-750'}`}>
                            {c.label}
                          </span>
                        </Link>

                        {/* Tooltip trigger info icon */}
                        <div className="relative flex items-center group/tooltip ml-2 shrink-0">
                          <span className="cursor-pointer text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-full hover:bg-slate-100">
                            <HelpCircle size={14} />
                          </span>
                          {/* Custom tooltip box */}
                          <div className="absolute right-0 bottom-full mb-2 hidden group-hover/tooltip:block w-56 bg-slate-900 text-white text-[11px] rounded-xl p-3 shadow-xl z-50 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-none">
                            {c.tooltip}
                            {/* Arrow */}
                            <div className="absolute top-full right-2 -mt-1 w-2.5 h-2.5 bg-slate-900 rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* ── Card 3: System Wallet ── */}
            {stats.systemWalletAddress && (
              <div className="bg-[#111111] rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] overflow-hidden border border-[#222] relative p-6 flex flex-col justify-center min-h-[260px]">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute -top-[50%] -left-[10%] w-[50%] h-[150%] bg-blue-600/10 blur-[100px] rounded-full rotate-12"></div>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 w-full">
                  <div className="flex-1 w-full text-center md:text-left">
                    <h2 className="text-base font-semibold tracking-tight text-white mb-1">{t('dashGasWallet')}</h2>
                    <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-3 mx-auto md:mx-0">
                      {language === 'es' ? 'Mantiene BNB para tarifas de red al transferir pagos criptográficos.' : 'Holds BNB for network fees when sweeping crypto payments.'}
                    </p>
                    <div className="flex flex-col items-center md:items-start">
                      <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                        <span className="text-sm font-medium text-slate-300 tracking-wide">{language === 'es' ? 'Gas Disponible' : 'Available Gas'}</span>
                        <button onClick={fetchStats} className="p-1 hover:bg-[#333] rounded transition text-slate-400 hover:text-white" title="Refresh Balance">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <img src="/coins/bnb.png" alt="BNB" className="w-6 h-6 object-contain shrink-0" />
                        <span className="text-4xl font-normal tracking-tight text-white leading-none">{bnbBal.toFixed(4)}</span>
                        <span className="text-lg font-medium text-slate-400">BNB</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono select-all mt-3 break-all bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-xl max-w-xs mx-auto md:mx-0">
                        {stats.systemWalletAddress}
                      </p>
                      {bnbBal < minRecommended && (
                        <p className="text-[10px] text-rose-400 mt-2 font-medium flex items-center gap-1.5 justify-center md:justify-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                          Min {minRecommended} BNB {language === 'es' ? 'requerido' : 'required'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 items-center mt-4 md:mt-0">
                    <div className="bg-white p-2 rounded-[1rem] shadow-xl">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${stats.systemWalletAddress}`} alt="QR Code" className="w-32 h-32 rounded-lg" />
                    </div>
                    <button onClick={handleCopy} className="w-full py-1.5 bg-white hover:bg-slate-100 text-black font-semibold text-xs rounded-xl transition shadow-md whitespace-nowrap px-3">
                      {copied ? (language === 'es' ? '✓ ¡Copiado!' : '✓ Copied!') : (language === 'es' ? 'Copiar Billetera' : 'Copy Wallet')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50/40 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center transition-all hover:bg-slate-50/70">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('dashRevenue')}</h3>
          <p className="text-3xl font-normal text-slate-900 tracking-tight">${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-slate-50/40 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center transition-all hover:bg-slate-50/70">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{language === 'es' ? 'Facturas Pagadas' : 'Paid Invoices'}</h3>
          <p className="text-3xl font-normal text-slate-900 tracking-tight">{stats.paidInvoices}</p>
        </div>
        <div className="bg-slate-50/40 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center transition-all hover:bg-slate-50/70">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{language === 'es' ? 'Facturas Pendientes' : 'Pending Invoices'}</h3>
          <p className="text-3xl font-normal text-slate-900 tracking-tight">{stats.pendingInvoices}</p>
        </div>
        <div className="bg-slate-50/40 p-6 rounded-2xl border border-slate-100 flex flex-col justify-center transition-all hover:bg-slate-50/70">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{t('dashActiveKeys')}</h3>
          <p className="text-3xl font-normal text-slate-900 tracking-tight">{stats.apiRequests}</p>
        </div>
      </div>


      <div className="mt-12">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col pt-8">
          
          {/* Top Info Header */}
          <div className="px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 z-10">
            <div>
              <h3 className="text-[1.4rem] font-semibold text-slate-900 tracking-tight mb-1">{language === 'es' ? 'Resumen de Ingresos' : 'Revenue Overview'}</h3>
              <p className="text-slate-500 font-medium text-sm">
                {language === 'es' ? 'Analiza y haz seguimiento a tus facturas cripto en diferentes plazos.' : 'Track and analyze your crypto invoice payments across different timeframes.'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 z-20">
              {/* Status Dropdown */}
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowChartDropdown(false);
                  }}
                  className="px-4 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>
                    {chartStatus === 'All' && (language === 'es' ? 'Todos los Estados' : 'All Statuses')}
                    {chartStatus === 'Paid' && (language === 'es' ? 'Pagado' : 'Paid')}
                    {chartStatus === 'Pending' && (language === 'es' ? 'Pendiente' : 'Pending')}
                    {chartStatus === 'Expired' && (language === 'es' ? 'Expirado' : 'Expired')}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showStatusDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-38 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-20 text-left animate-fadeIn">
                      {[
                        { value: 'All', label: language === 'es' ? 'Todos los Estados' : 'All Statuses' },
                        { value: 'Paid', label: language === 'es' ? 'Pagado' : 'Paid' },
                        { value: 'Pending', label: language === 'es' ? 'Pendiente' : 'Pending' },
                        { value: 'Expired', label: language === 'es' ? 'Expirado' : 'Expired' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setChartStatus(opt.value);
                            setShowStatusDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 transition ${chartStatus === opt.value ? 'text-slate-900 bg-slate-50/50' : 'text-slate-600'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Timeframe Dropdown */}
              <div className="relative">
                <button 
                  type="button"
                  onClick={() => {
                    setShowChartDropdown(!showChartDropdown);
                    setShowStatusDropdown(false);
                  }}
                  className="px-4 py-2 border border-slate-200 bg-white rounded-xl focus:outline-none text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>
                    {chartFilter === 'yearly' && (language === 'es' ? 'Anual' : 'Yearly')}
                    {chartFilter === 'monthly' && (language === 'es' ? 'Mensual' : 'Monthly')}
                    {chartFilter === 'weekly' && (language === 'es' ? 'Semanal' : 'Weekly')}
                    {chartFilter === '7days' && (language === 'es' ? 'Últimos 7 Días' : 'Last 7 Days')}
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showChartDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showChartDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowChartDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-20 text-left animate-fadeIn">
                      {[
                        { value: 'yearly', label: language === 'es' ? 'Anual' : 'Yearly' },
                        { value: 'monthly', label: language === 'es' ? 'Mensual' : 'Monthly' },
                        { value: 'weekly', label: language === 'es' ? 'Semanal' : 'Weekly' },
                        { value: '7days', label: language === 'es' ? 'Últimos 7 Días' : 'Last 7 Days' }
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setChartFilter(opt.value);
                            setShowChartDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 transition ${chartFilter === opt.value ? 'text-slate-900 bg-slate-50/50' : 'text-slate-600'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Graph */}
          <div className="h-56 w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getGraphData()} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: '600' }}
                  dy={5}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '8px 12px' }}
                  itemStyle={{ color: '#0f172a', fontWeight: '600', fontSize: '14px' }}
                  formatter={(value) => [`$${value}`, language === 'es' ? 'Ingresos' : 'Revenue']}
                  labelStyle={{ color: '#64748b', fontSize: '12px', fontWeight: '500', marginBottom: '2px' }}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#bfdbfe" 
                  strokeWidth={2.5} 
                  dot={false} 
                  activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 2 }}
                  isAnimationActive={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
