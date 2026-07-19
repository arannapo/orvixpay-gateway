"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { DollarSign, FileText, Users, Cpu, ArrowUpRight, TrendingUp, ChevronDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import Link from 'next/link';

export default function AdminDashboard() {
  const { language } = useLanguage();
  const [stats, setStats] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Chart States
  const [chartFilter, setChartFilter] = useState('7days');
  const [chartStatus, setChartStatus] = useState('Paid');
  const [showChartDropdown, setShowChartDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats', { cache: 'no-store' }).then(res => res.json()),
      fetch('/api/admin/invoices', { cache: 'no-store' }).then(res => res.json())
    ]).then(([statsData, invoicesData]) => {
      if (statsData.success) {
        setStats(statsData.stats);
        setRecentInvoices(statsData.recentInvoices || []);
      }
      if (invoicesData.success) {
        setAllInvoices(invoicesData.invoices || []);
      }
    })
    .catch(err => console.error('Error fetching admin dashboard data:', err))
    .finally(() => setLoading(false));
  }, []);

  const t = (en, es) => (language === 'es' ? es : en);

  const matchesStatus = (inv) => {
    if (chartStatus === 'All') return true;
    return inv.status === chartStatus;
  };

  const getGraphData = () => {
    const data = [];
    const now = new Date();

    if (chartFilter === '7days') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        
        const revenue = allInvoices
          .filter(inv => {
            if (!matchesStatus(inv)) return false;
            const invDate = new Date(inv.createdAt);
            return invDate.toDateString() === d.toDateString();
          })
          .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);

        data.push({ date: dateStr, revenue: revenue });
      }
    } else if (chartFilter === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const start = new Date();
        start.setDate(now.getDate() - (i + 1) * 7);
        const end = new Date();
        end.setDate(now.getDate() - i * 7);
        
        const label = language === 'es' ? `Semana ${4 - i}` : `Week ${4 - i}`;
        const revenue = allInvoices
          .filter(inv => {
            if (!matchesStatus(inv)) return false;
            const invDate = new Date(inv.createdAt);
            return invDate >= start && invDate < end;
          })
          .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
        
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
          .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
        
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
          .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
        
        data.push({ date: label, revenue: revenue });
      }
    }

    return data;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-purple-650 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">{t('Loading platform stats...', 'Cargando estadísticas de la plataforma...')}</p>
      </div>
    );
  }

  const statCards = [
    {
      title: t('Total Volume Processed', 'Volumen Total Procesado'),
      value: `$${(stats?.totalVolume || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: t('Total Invoices', 'Facturas Totales'),
      value: stats?.totalInvoices || 0,
      icon: FileText,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: t('Active Merchants', 'Comercios Activos'),
      value: `${stats?.activeMerchants || 0} / ${stats?.totalMerchants || 0}`,
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: t('Combined Gas Reserves', 'Reservas de Gas Combinadas'),
      value: `${stats?.platformGasReserve || '0.0000'} BNB`,
      icon: Cpu,
      color: 'bg-amber-50 text-amber-600',
    }
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-[2rem] p-8 text-white shadow-xl">
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full">
            {t('System Administration', 'Administración del Sistema')}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {t('Platform Overview', 'Resumen de la Plataforma')}
          </h2>
          <p className="text-slate-400 text-sm max-w-xl font-medium">
            {t('Audit platform volume, inspect registered merchant actions, and verify network transaction logs.', 'Audite el volumen de la plataforma, inspeccione las acciones de los comercios registrados y verifique los registros de transacciones.')}
          </p>
        </div>
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pointer-events-none">
          <TrendingUp className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Grid Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm flex items-center justify-between hover:border-slate-350 transition-all">
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                <p className="text-2xl font-normal text-slate-900 tracking-tight">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color} shadow-sm shrink-0`}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform Revenue Overview Chart */}
      <div className="bg-white rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden flex flex-col pt-8">
        <div className="px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1">{t('Platform Volume Overview', 'Resumen de Volumen de la Plataforma')}</h3>
            <p className="text-xs text-slate-400 font-medium">
              {t('Track and analyze aggregate volume across all merchant integrations.', 'Siga y analice el volumen total de pagos de todos los comercios.')}
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
                  {chartStatus === 'All' && t('All Statuses', 'Todos los Estados')}
                  {chartStatus === 'Paid' && t('Paid', 'Pagado')}
                  {chartStatus === 'Pending' && t('Pending', 'Pendiente')}
                  {chartStatus === 'Expired' && t('Expired', 'Expirado')}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showStatusDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showStatusDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-38 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-20 text-left">
                    {[
                      { value: 'All', label: t('All Statuses', 'Todos los Estados') },
                      { value: 'Paid', label: t('Paid', 'Pagado') },
                      { value: 'Pending', label: t('Pending', 'Pendiente') },
                      { value: 'Expired', label: t('Expired', 'Expirado') }
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
                  {chartFilter === 'yearly' && t('Yearly', 'Anual')}
                  {chartFilter === 'monthly' && t('Monthly', 'Mensual')}
                  {chartFilter === 'weekly' && t('Weekly', 'Semanal')}
                  {chartFilter === '7days' && t('Last 7 Days', 'Últimos 7 Días')}
                </span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showChartDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showChartDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowChartDropdown(false)} />
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl border border-slate-200 shadow-lg py-1.5 z-20 text-left">
                    {[
                      { value: 'yearly', label: t('Yearly', 'Anual') },
                      { value: 'monthly', label: t('Monthly', 'Mensual') },
                      { value: 'weekly', label: t('Weekly', 'Semanal') },
                      { value: '7days', label: t('Last 7 Days', 'Últimos 7 Días') }
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
                formatter={(value) => [`$${value}`, t('Revenue', 'Ingresos')]}
                labelStyle={{ color: '#64748b', fontSize: '12px', fontWeight: '500', marginBottom: '2px' }}
                cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '5 5' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#d8b4fe" 
                strokeWidth={2.5} 
                dot={false} 
                activeDot={{ r: 6, fill: '#a855f7', stroke: '#ffffff', strokeWidth: 2 }}
                isAnimationActive={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">{t('Recent Platform Invoices', 'Facturas Recientes de la Plataforma')}</h3>
            <p className="text-xs text-slate-400 font-medium">{t('Real-time payment logs across all registered integrations.', 'Registros de pago en tiempo real de todas las integraciones registradas.')}</p>
          </div>
          <Link href="/admin/invoices" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
            {t('View All Invoices', 'Ver Todas las Facturas')}
            <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                <th className="px-6 py-4">{t('Merchant', 'Comercio')}</th>
                <th className="px-6 py-4">{t('Client', 'Cliente')}</th>
                <th className="px-6 py-4">{t('Amount', 'Monto')}</th>
                <th className="px-6 py-4">{t('Status', 'Estado')}</th>
                <th className="px-6 py-4">{t('Created At', 'Creado el')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm font-semibold text-slate-400 bg-slate-50/20">
                    {t('No recent invoices found.', 'No se encontraron facturas recientes.')}
                  </td>
                </tr>
              ) : (
                recentInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs shrink-0 border border-purple-100">
                          {inv.merchantId?.businessName ? inv.merchantId.businessName.substring(0,2).toUpperCase() : 'M'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{inv.merchantId?.businessName || 'Merchant'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{inv.merchantId?.email || ''}</p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5 select-all">ID: {inv.merchantId?._id || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="text-xs font-semibold text-slate-600 font-mono">{inv.customerEmail}</span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="text-xs font-semibold text-slate-800">${(inv.amount || 0).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        inv.status === 'Paid' || inv.status === 'Overpaid'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : ['Pending', 'Processing'].includes(inv.status)
                          ? 'bg-amber-50 text-amber-600 border-amber-100'
                          : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="text-[10px] text-slate-400 font-semibold">{new Date(inv.createdAt).toLocaleString()}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
