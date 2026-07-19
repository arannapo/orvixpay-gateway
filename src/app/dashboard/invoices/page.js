"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, DollarSign, Download, SlidersHorizontal, X, RefreshCw, Link2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import toast from 'react-hot-toast';

export default function InvoicesPage() {
  const { t, language } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Sort States
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [coinFilter, setCoinFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [amountFilter, setAmountFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleLimit, setVisibleLimit] = useState(20);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    setVisibleLimit(20);
  }, [statusFilter, coinFilter, dateFilter, amountFilter, sortBy, searchQuery]);

  const handleExportCSV = () => {
    if (sortedInvoices.length === 0) {
      toast.error(language === 'es' ? 'No hay registros para exportar' : 'No records to export');
      return;
    }

    // Define CSV headers
    const headers = ['Invoice ID', 'Order ID', 'Amount', 'Coin Token', 'Status', 'Creation Date', 'Customer Name', 'Customer Email', 'Description'];
    
    // Map data to CSV rows
    const rows = sortedInvoices.map(inv => [
      inv._id,
      `"${inv.orderId.replace(/"/g, '""')}"`,
      inv.amount,
      inv.coin,
      inv.status,
      new Date(inv.createdAt).toISOString(),
      inv.customerName ? `"${inv.customerName.replace(/"/g, '""')}"` : '',
      inv.customerEmail ? `"${inv.customerEmail.replace(/"/g, '""')}"` : '',
      inv.description ? `"${inv.description.replace(/"/g, '""')}"` : ''
    ]);

    // Construct CSV content
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(language === 'es' ? '¡Facturas exportadas con éxito!' : 'Invoices exported successfully!');
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoice/list');
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Error fetching invoices', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'Paid') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (status === 'Pending') return 'bg-slate-50 text-slate-650 border border-slate-200/60';
    if (status === 'Processing') return 'bg-blue-50 text-blue-700 border border-blue-100';
    if (status === 'Partially Paid') return 'bg-amber-50 text-amber-700 border border-amber-100';
    if (status === 'Overpaid') return 'bg-purple-50 text-purple-700 border border-purple-100';
    if (status === 'Gas Funding') return 'bg-indigo-50 text-indigo-700 border border-indigo-100';
    if (status === 'Expired') return 'bg-rose-50 text-rose-700 border border-rose-100';
    return 'bg-slate-55 text-slate-700 border border-slate-200';
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    const matchesCoin = coinFilter === 'All' || inv.coin === coinFilter;
    const matchesSearch = searchQuery.trim() === '' || 
      inv.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customerName && inv.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (inv.customerEmail && inv.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Date Filter Logic
    let matchesDate = true;
    if (dateFilter !== 'All') {
      const invDate = new Date(inv.createdAt);
      const now = new Date();
      if (dateFilter === 'today') {
        matchesDate = invDate.toDateString() === now.toDateString();
      } else if (dateFilter === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = invDate >= sevenDaysAgo;
      } else if (dateFilter === '30days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = invDate >= thirtyDaysAgo;
      }
    }

    // Amount Filter Logic
    let matchesAmount = true;
    if (amountFilter !== 'All') {
      const amt = parseFloat(inv.amount);
      if (amountFilter === 'under100') {
        matchesAmount = amt < 100;
      } else if (amountFilter === '100to1000') {
        matchesAmount = amt >= 100 && amt <= 1000;
      } else if (amountFilter === 'over1000') {
        matchesAmount = amt > 1000;
      }
    }

    return matchesStatus && matchesCoin && matchesSearch && matchesDate && matchesAmount;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === 'amount_desc') {
      return parseFloat(b.amount) - parseFloat(a.amount);
    }
    if (sortBy === 'amount_asc') {
      return parseFloat(a.amount) - parseFloat(b.amount);
    }
    return 0;
  });

  const visibleInvoices = sortedInvoices.slice(0, visibleLimit);

  return (
    <div className="bg-white flex flex-col relative min-w-0 w-full h-full">
      <div className="relative overflow-hidden p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 bg-white">
        {/* Background mesh & grid */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-fuchsia-100/60 pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MCAwIEwgMCAwIDAgNDApIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMCwwLDAsMC4wMikiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4n)] opacity-85 pointer-events-none z-0"></div>
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-indigo-200/30 blur-[60px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-300/30 blur-[60px] rounded-full pointer-events-none z-0"></div>

        <div className="relative z-10">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">{t('dashInvoices')}</h2>
          <p className="text-slate-500 font-medium text-xs">
            {language === 'es' ? 'Administra y haz seguimiento a tus facturas cripto generadas.' : 'Manage and track your generated crypto invoices.'}
          </p>
        </div>
        <Link href="/dashboard/invoices/new" className="relative z-10 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-[13px] hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-md shadow-purple-100 shrink-0">
          <DollarSign size={16} strokeWidth={1.5} /> {language === 'es' ? 'Crear Factura' : 'Create Invoice'}
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="px-6 md:px-8 py-5 bg-slate-50/40 border-b border-slate-100 flex flex-col gap-4 relative">
        {/* Row 1: Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          {/* Left: Search Input */}
          <div className="w-full sm:w-80 shrink-0">
            <input 
              type="text" 
              placeholder={language === 'es' ? 'Buscar por ID de Orden, cliente...' : 'Search by Order ID, customer...'} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-0 focus:border-slate-200 text-slate-755 bg-white hover:bg-slate-50/50 transition shadow-sm text-sm"
            />
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 relative w-full sm:w-auto">
            {/* Collapsible Dropdown Container */}
            <div className="relative flex-1 sm:flex-initial">
              <button 
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-semibold transition flex items-center justify-center gap-2 shadow-sm ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
              >
                <SlidersHorizontal size={15} strokeWidth={showFilters ? 2.5 : 2} /> 
                {showFilters ? (language === 'es' ? 'Ocultar Filtros' : 'Hide Filters') : (language === 'es' ? 'Filtros' : 'Filters')}
              </button>

              {/* Dropdown Card */}
              {showFilters && (
                <>
                  {/* Click overlay to close */}
                  <div className="fixed inset-0 z-10 bg-slate-900/10 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none" onClick={() => setShowFilters(false)} />
                  
                  <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2.5rem)] max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-5 z-20 space-y-4 text-left animate-fadeIn md:absolute md:top-auto md:left-auto md:right-0 md:transform-none md:w-96 md:mt-2">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{language === 'es' ? 'Filtrar Registros' : 'Filter Records'}</h4>
                      <button 
                        type="button" 
                        onClick={() => setShowFilters(false)}
                        className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-100 rounded-lg"
                      >
                        <X size={15} strokeWidth={2.5} />
                      </button>
                    </div>
                    
                    {/* Status & Token side-by-side */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Status Filter */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-455 tracking-wider">{language === 'es' ? 'Estado' : 'Status'}</span>
                        <select 
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-xs font-semibold text-slate-700 shadow-sm"
                        >
                          <option value="All">{language === 'es' ? 'Todos los Estados' : 'All Statuses'}</option>
                          <option value="Pending">{t('dashStatusPending')}</option>
                          <option value="Paid">{t('dashStatusPaid')}</option>
                          <option value="Expired">{t('dashStatusExpired')}</option>
                        </select>
                      </div>

                      {/* Coin Filter */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-455 tracking-wider">Token</span>
                        <select 
                          value={coinFilter}
                          onChange={(e) => setCoinFilter(e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-xs font-semibold text-slate-700 shadow-sm"
                        >
                          <option value="All">{language === 'es' ? 'Todos los Tokens' : 'All Coins'}</option>
                          <option value="USDT">USDT</option>
                          <option value="USDC">USDC</option>
                        </select>
                      </div>
                    </div>

                    {/* Date & Amount side-by-side */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Date Filter */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-455 tracking-wider">{language === 'es' ? 'Fecha' : 'Date'}</span>
                        <select 
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-xs font-semibold text-slate-700 shadow-sm"
                        >
                          <option value="All">{language === 'es' ? 'Todo el tiempo' : 'All Time'}</option>
                          <option value="today">{language === 'es' ? 'Hoy' : 'Today'}</option>
                          <option value="7days">{language === 'es' ? 'Últimos 7 Días' : 'Last 7 Days'}</option>
                          <option value="30days">{language === 'es' ? 'Últimos 30 Días' : 'Last 30 Days'}</option>
                        </select>
                      </div>

                      {/* Amount Filter */}
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-455 tracking-wider">{language === 'es' ? 'Monto' : 'Amount'}</span>
                        <select 
                          value={amountFilter}
                          onChange={(e) => setAmountFilter(e.target.value)}
                          className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-xs font-semibold text-slate-700 shadow-sm"
                        >
                          <option value="All">{language === 'es' ? 'Todos los Montos' : 'All Amounts'}</option>
                          <option value="under100">{language === 'es' ? 'Menos de $100' : 'Under $100'}</option>
                          <option value="100to1000">$100 - $1,000</option>
                          <option value="over1000">{language === 'es' ? 'Más de $1,000' : 'Over $1,000'}</option>
                        </select>
                      </div>
                    </div>

                    {/* Sort By */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold text-slate-455 tracking-wider">{language === 'es' ? 'Ordenar Por' : 'Sort By'}</span>
                      <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-xs font-semibold text-slate-700 shadow-sm"
                      >
                        <option value="newest">{language === 'es' ? 'Más Recientes' : 'Newest First'}</option>
                        <option value="oldest">{language === 'es' ? 'Más Antiguos' : 'Oldest First'}</option>
                        <option value="amount_desc">{language === 'es' ? 'Monto: Mayor-Menor' : 'Amount: High-Low'}</option>
                        <option value="amount_asc">{language === 'es' ? 'Monto: Menor-Mayor' : 'Amount: Low-High'}</option>
                      </select>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 flex justify-end border-t border-slate-100">
                      <button 
                        type="button" 
                        onClick={() => {
                          setStatusFilter('All');
                          setCoinFilter('All');
                          setDateFilter('All');
                          setAmountFilter('All');
                          setSortBy('newest');
                        }}
                        className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition shadow-sm bg-white"
                      >
                        {language === 'es' ? 'Restablecer Filtros' : 'Reset Filters'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={() => {
                const toastId = toast.loading(language === 'es' ? 'Actualizando facturas...' : 'Refreshing invoices...');
                fetchInvoices().then(() => toast.success(language === 'es' ? '¡Datos actualizados!' : 'Data refreshed!', { id: toastId }));
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 shrink-0"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{language === 'es' ? 'Actualizar' : 'Refresh'}</span>
            </button>

            <button 
              onClick={handleExportCSV}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100/70 hover:text-emerald-800 text-sm font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 shrink-0"
            >
              <Download size={14} strokeWidth={2} className="text-emerald-600" /> {language === 'es' ? 'Exportar CSV' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 space-y-4 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded-2xl w-full"></div>
          ))}
        </div>
      ) : sortedInvoices.length === 0 ? (
        <div className="p-8 text-center text-slate-500 py-16">
          <p className="mb-2 font-semibold">{language === 'es' ? 'No se encontraron facturas que coincidan con los criterios.' : 'No invoices found matching criteria.'}</p>
          <p className="text-sm">{language === 'es' ? 'Intente modificar su consulta de búsqueda o las opciones de filtro.' : 'Try modifying your search query or filter options.'}</p>
        </div>
      ) : (
        <>
          {/* Mobile Card List View (Visible on Mobile Only) */}
          <div className="block md:hidden divide-y divide-slate-100 overflow-hidden">
            {visibleInvoices.map((inv) => (
              <div key={inv._id} className="p-5 space-y-3 bg-white hover:bg-slate-50/50 transition">
                {/* Row 1: Order ID & Status Badge */}
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-slate-800 text-[13.5px]">{language === 'es' ? 'Orden' : 'Order'}: {inv.orderId}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(inv.status)}`}>
                    {inv.status === 'Paid' ? t('dashStatusPaid') : inv.status === 'Pending' ? t('dashStatusPending') : inv.status === 'Expired' ? t('dashStatusExpired') : inv.status}
                  </span>
                </div>
                
                {/* Row 2: Customer Details */}
                {(inv.customerName || inv.customerEmail) && (
                  <div className="text-xs text-slate-500 font-medium space-y-0.5">
                    {inv.customerName && <p className="text-slate-700">{language === 'es' ? 'Cliente' : 'Customer'}: {inv.customerName}</p>}
                    {inv.customerEmail && <p className="text-slate-400 font-mono text-[11px]">{inv.customerEmail}</p>}
                  </div>
                )}

                {/* Row 3: Amount/Coin, Date, and ID */}
                <div className="flex justify-between items-end pt-1">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-mono">ID: {inv._id}</p>
                    <p className="text-[11px] text-slate-450 font-semibold">
                      {new Date(inv.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                   <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">{language === 'es' ? 'Monto' : 'Amount'}</span>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[13px] font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150">
                        {inv.amount} {inv.coin}
                      </span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">BSC (BEP20)</span>
                    </div>
                  </div>
                </div>

                {/* Row 4: Action */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <a 
                    href={`/invoice/${inv._id}`} 
                    target="_blank" 
                    className="flex-1 justify-center inline-flex items-center gap-1.5 text-slate-655 hover:text-slate-900 font-bold bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition text-xs shadow-sm border border-slate-200/40"
                  >
                    {language === 'es' ? 'Ver Factura' : 'View Invoice'} <ExternalLink size={13} />
                  </a>
                  {inv.transactionHash && (
                    <a 
                      href={`https://bscscan.com/tx/${inv.transactionHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 justify-center inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition text-xs shadow-sm border border-emerald-200/40"
                    >
                      {language === 'es' ? 'Enlace Sweep' : 'Sweep Link'} <Link2 size={13} />
                    </a>
                  )}
                  {inv.overpaidDetails?.refundTxHash && (
                    <a 
                      href={`https://bscscan.com/tx/${inv.overpaidDetails.refundTxHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 justify-center inline-flex items-center gap-1.5 text-purple-700 hover:text-purple-900 font-bold bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition text-xs shadow-sm border border-purple-200/40"
                    >
                      {language === 'es' ? 'Enlace Reembolso' : 'Refund Link'} <Link2 size={13} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-650">
              <thead className="bg-white text-xs font-semibold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-5 md:px-8 py-4 md:py-5">{language === 'es' ? 'Detalles' : 'Details'}</th>
                  <th className="px-5 md:px-8 py-4 md:py-5">{language === 'es' ? 'Monto' : 'Amount'}</th>
                  <th className="px-5 md:px-8 py-4 md:py-5">Token</th>
                  <th className="px-5 md:px-8 py-4 md:py-5">{language === 'es' ? 'Estado' : 'Status'}</th>
                  <th className="px-5 md:px-8 py-4 md:py-5">{language === 'es' ? 'Fecha' : 'Date'}</th>
                  <th className="px-5 md:px-8 py-4 md:py-5 text-right">{language === 'es' ? 'Acción' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 md:px-8 py-4 md:py-5 font-medium text-slate-800 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-800 text-[13.5px]">{language === 'es' ? 'Orden' : 'Order'}: {inv.orderId}</span>
                        {(inv.customerName || inv.customerEmail) && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            {inv.customerName || (language === 'es' ? 'Sin Nombre' : 'No Name')} {inv.customerEmail ? `(${inv.customerEmail})` : ''}
                          </span>
                        )}
                        <span className="text-[9.5px] text-slate-400 font-mono">Invoice ID: {inv._id}</span>
                      </div>
                    </td>
                    <td className="px-5 md:px-8 py-4 md:py-5 font-medium text-slate-700 whitespace-nowrap">{inv.amount}</td>
                    <td className="px-5 md:px-8 py-4 md:py-5 font-medium text-slate-700 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-800 text-xs font-semibold">{inv.coin}</span>
                        <span className="text-slate-400 text-[10px] font-medium">BSC (BEP20)</span>
                      </div>
                    </td>
                    <td className="px-5 md:px-8 py-4 md:py-5 whitespace-nowrap">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(inv.status)}`}>
                        {inv.status === 'Paid' ? t('dashStatusPaid') : inv.status === 'Pending' ? t('dashStatusPending') : inv.status === 'Expired' ? t('dashStatusExpired') : inv.status}
                      </span>
                    </td>
                    <td className="px-5 md:px-8 py-4 md:py-5 font-medium text-slate-555 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-slate-700 text-xs font-semibold">{new Date(inv.createdAt).toLocaleDateString()}</span>
                        <span className="text-slate-400 text-[10px] font-medium">
                          {new Date(inv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 md:px-8 py-4 md:py-5 text-right whitespace-nowrap">
                      <div className="flex justify-end items-center gap-2">
                        {inv.transactionHash && (
                          <a 
                            href={`https://bscscan.com/tx/${inv.transactionHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition text-xs border border-emerald-100"
                            title="View Sweep Transaction on BscScan"
                          >
                            {language === 'es' ? 'Enlace Sweep' : 'Sweep Link'} <Link2 size={12} />
                          </a>
                        )}
                        {inv.overpaidDetails?.refundTxHash && (
                          <a 
                            href={`https://bscscan.com/tx/${inv.overpaidDetails.refundTxHash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-bold bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full transition text-xs border border-purple-100"
                            title="View Refund Transaction on BscScan"
                          >
                            {language === 'es' ? 'Enlace Reembolso' : 'Refund Link'} <Link2 size={12} />
                          </a>
                        )}
                        <a href={`/invoice/${inv._id}`} target="_blank" className="inline-flex items-center gap-1 text-slate-655 hover:text-slate-900 font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition text-xs border border-slate-200/40">
                          {language === 'es' ? 'Ver' : 'View'} <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Show More Pagination Button */}
          {sortedInvoices.length > visibleLimit && (
            <div className="p-5 text-center border-t border-slate-100 bg-slate-50/20">
              <button
                type="button"
                onClick={() => setVisibleLimit((prev) => prev + 20)}
                className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition"
              >
                {language === 'es' ? 'Mostrar Más' : 'Show More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
