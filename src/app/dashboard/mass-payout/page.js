"use client";

import { useState, useEffect } from 'react';
import { 
  Send, 
  Plus, 
  Trash2, 
  Upload, 
  Download, 
  ExternalLink, 
  Copy, 
  RefreshCw, 
  FileText, 
  Layers, 
  Search, 
  Check, 
  X,
  Link2,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import toast from 'react-hot-toast';
import { ethers } from 'ethers';

const SUPPORTED_COINS = [
  { symbol: 'USDT', name: 'Tether USD', icon: '/coins/usdt.png' },
  { symbol: 'USDC', name: 'USD Coin', icon: '/coins/usdc.png' },
  { symbol: 'BNB', name: 'BNB Coin', icon: '/coins/bnb.png' }
];

export default function MassPayoutPage() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'history'
  const [inputMode, setInputMode] = useState('manual'); // 'manual' | 'bulk'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Stats & History
  const [payouts, setPayouts] = useState([]);
  const [visibleLimit, setVisibleLimit] = useState(20);

  // System Wallet (holds USDT, USDC, and BNB Gas)
  const [systemWallet, setSystemWallet] = useState({
    address: '',
    bnbBalance: '0.0000',
    usdtBalance: '0.00',
    usdcBalance: '0.00'
  });
  const [refreshingWallet, setRefreshingWallet] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Form State
  const [selectedCoin, setSelectedCoin] = useState('USDT');
  const [recipients, setRecipients] = useState([
    { id: 1, address: '', amount: '', memo: '' },
    { id: 2, address: '', amount: '', memo: '' }
  ]);
  const [bulkText, setBulkText] = useState('');

  // History Filter State (identical to Invoices page)
  const [searchHistory, setSearchHistory] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [coinFilter, setCoinFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedBatchDetails, setSelectedBatchDetails] = useState(null);

  useEffect(() => {
    fetchPayouts();
  }, []);

  useEffect(() => {
    setVisibleLimit(20);
  }, [statusFilter, coinFilter, dateFilter, searchHistory]);

  const fetchPayouts = async (isManual = false) => {
    if (isManual) setRefreshingWallet(true);
    try {
      const res = await fetch('/api/payouts');
      const data = await res.json();
      if (data.success) {
        setPayouts(data.payouts || []);
        if (data.systemWallet) setSystemWallet(data.systemWallet);
        if (isManual) {
          toast.success(language === 'es' ? '¡Saldos actualizados con éxito!' : 'Balances refreshed successfully!');
        }
      }
    } catch (err) {
      console.error('Error loading payouts:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshingWallet(false);
    }
  };

  const handleCopyAddress = () => {
    if (systemWallet.address) {
      navigator.clipboard.writeText(systemWallet.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
      toast.success(language === 'es' ? '¡Dirección copiada!' : 'Address copied!');
    }
  };

  const handleAddRow = () => {
    setRecipients(prev => [
      ...prev,
      { id: Date.now() + Math.random(), address: '', amount: '', memo: '' }
    ]);
  };

  const handleRemoveRow = (id) => {
    if (recipients.length <= 1) {
      toast.error(language === 'es' ? 'Mínimo 1 destinatario requerido' : 'At least 1 recipient is required');
      return;
    }
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const handleRowChange = (id, field, value) => {
    setRecipients(prev => prev.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleParseBulk = () => {
    if (!bulkText.trim()) {
      toast.error(language === 'es' ? 'Pegue los datos en formato CSV' : 'Please paste CSV data');
      return;
    }

    const lines = bulkText.trim().split('\n');
    const parsed = [];
    let skipped = 0;

    lines.forEach((line, idx) => {
      const clean = line.trim();
      if (!clean || clean.startsWith('#')) return;

      const parts = clean.split(/[,;\t]+/).filter(Boolean);
      if (parts.length >= 2) {
        const address = parts[0].trim();
        const amount = parts[1].trim();
        const memo = parts.slice(2).join(' ').trim();

        if (ethers.isAddress(address) && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
          parsed.push({
            id: Date.now() + idx + Math.random(),
            address,
            amount: parseFloat(amount).toString(),
            memo
          });
        } else {
          skipped++;
        }
      } else {
        skipped++;
      }
    });

    if (parsed.length === 0) {
      toast.error(language === 'es' ? 'No se detectaron destinatarios válidos' : 'No valid recipients detected');
      return;
    }

    setRecipients(parsed);
    setInputMode('manual');
    toast.success(
      language === 'es'
        ? `${parsed.length} destinatarios cargados ${skipped > 0 ? `(${skipped} omitidos)` : ''}`
        : `Loaded ${parsed.length} recipients ${skipped > 0 ? `(${skipped} skipped)` : ''}`
    );
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setBulkText(content);
        setInputMode('bulk');
        toast.success(language === 'es' ? 'Archivo CSV cargado' : 'CSV file loaded');
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const sample = `address,amount,memo\n0x71C8705775502e33644243b95a04381cf3a60a88,50.00,Affiliate Payout\n0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1,120.50,Monthly Bonus\n0xdD870fA1b7C4700F2BD7f44238821C26f7392148,25.00,Referral`;
    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'orvixpay_mass_payout_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportHistoryCSV = () => {
    if (filteredPayouts.length === 0) {
      toast.error(language === 'es' ? 'No hay registros para exportar' : 'No records to export');
      return;
    }

    const headers = ['Batch ID', 'Date', 'Recipients', 'Amount', 'Coin', 'Status', 'Tx Hash'];
    const rows = filteredPayouts.map(b => [
      b.batchId,
      new Date(b.createdAt).toISOString(),
      b.recipientsCount,
      b.totalAmount,
      b.coin,
      b.status,
      b.txHash || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `mass_payouts_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(language === 'es' ? '¡Lotes exportados con éxito!' : 'Batches exported successfully!');
  };

  const handleExportBatchCSV = (batch) => {
    const headers = ['Recipient Wallet', 'Amount', 'Coin', 'Memo', 'Status', 'Tx Hash'];
    const rows = (batch.recipients || []).map(r => [
      r.address,
      r.amount,
      batch.coin,
      `"${(r.memo || '').replace(/"/g, '""')}"`,
      r.status,
      r.txHash || batch.txHash || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${batch.batchId}_payout.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations & Validation
  const validRecipients = recipients.filter(
    r => r.address.trim() && ethers.isAddress(r.address.trim()) && !isNaN(parseFloat(r.amount)) && parseFloat(r.amount) > 0
  );

  const totalPayoutAmount = validRecipients.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0);
  const estGasNum = 0.0008 + validRecipients.length * 0.00015;
  const estimatedGasFee = estGasNum.toFixed(4) + ' BNB';

  const getAvailableBalance = (coin) => {
    if (coin === 'USDT') return parseFloat(systemWallet.usdtBalance || 0);
    if (coin === 'USDC') return parseFloat(systemWallet.usdcBalance || 0);
    if (coin === 'BNB') return parseFloat(systemWallet.bnbBalance || 0);
    return 0;
  };

  const availableCoinBalance = getAvailableBalance(selectedCoin);
  const currentBnbBalance = parseFloat(systemWallet.bnbBalance || 0);

  const hasInsufficientToken = validRecipients.length > 0 && totalPayoutAmount > availableCoinBalance;
  const hasInsufficientGas = validRecipients.length > 0 && currentBnbBalance < estGasNum;

  const handleReviewPayout = () => {
    if (validRecipients.length === 0) {
      toast.error(
        language === 'es'
          ? 'Ingrese al menos un destinatario válido con monto > 0'
          : 'Please enter at least one valid recipient with amount > 0'
      );
      return;
    }
    if (validRecipients.length !== recipients.length) {
      toast.error(
        language === 'es'
          ? 'Revise las direcciones o montos inválidos antes de continuar'
          : 'Please fix invalid addresses or amounts before continuing'
      );
      return;
    }
    if (hasInsufficientToken) {
      toast.error(
        language === 'es'
          ? `Saldo insuficiente de ${selectedCoin}. Deposite en la dirección de la billetera.`
          : `Insufficient ${selectedCoin}. Deposit to the system wallet address.`
      );
      return;
    }
    if (hasInsufficientGas) {
      toast.error(
        language === 'es'
          ? 'Saldo insuficiente de BNB para gas. Deposite en la dirección de la billetera.'
          : 'Insufficient BNB gas. Deposit to the system wallet address.'
      );
      return;
    }
    setShowConfirmModal(true);
  };

  const handleExecutePayout = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coin: selectedCoin,
          recipients: validRecipients.map(r => ({
            address: r.address.trim(),
            amount: parseFloat(r.amount),
            memo: r.memo.trim()
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success(
          language === 'es'
            ? `¡Lote procesado exitosamente (${validRecipients.length} destinatarios)!`
            : `Payout executed successfully (${validRecipients.length} recipients)!`
        );
        setShowConfirmModal(false);
        setRecipients([
          { id: 1, address: '', amount: '', memo: '' },
          { id: 2, address: '', amount: '', memo: '' }
        ]);
        setBulkText('');
        fetchPayouts();
        setActiveTab('history');
      } else {
        toast.error(data.error || (language === 'es' ? 'Error al procesar el lote' : 'Failed to process payout'));
      }
    } catch (err) {
      console.error(err);
      toast.error(language === 'es' ? 'Error de red' : 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  // Status badge matching Invoices page getStatusColor
  const getStatusColor = (status) => {
    if (status === 'Completed' || status === 'Paid') return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (status === 'Pending') return 'bg-slate-50 text-slate-650 border border-slate-200/60';
    if (status === 'Processing') return 'bg-blue-50 text-blue-700 border border-blue-100';
    if (status === 'Failed') return 'bg-rose-50 text-rose-700 border border-rose-100';
    return 'bg-slate-55 text-slate-700 border border-slate-200';
  };

  // Filter history items matching Invoices logic
  const filteredPayouts = payouts.filter(b => {
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesCoin = coinFilter === 'All' || b.coin === coinFilter;
    const matchesSearch = !searchHistory.trim() || 
      b.batchId.toLowerCase().includes(searchHistory.toLowerCase()) ||
      (b.txHash && b.txHash.toLowerCase().includes(searchHistory.toLowerCase()));

    let matchesDate = true;
    if (dateFilter !== 'All') {
      const bDate = new Date(b.createdAt);
      const now = new Date();
      if (dateFilter === 'today') {
        matchesDate = bDate.toDateString() === now.toDateString();
      } else if (dateFilter === '7days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesDate = bDate >= sevenDaysAgo;
      } else if (dateFilter === '30days') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesDate = bDate >= thirtyDaysAgo;
      }
    }

    return matchesStatus && matchesCoin && matchesSearch && matchesDate;
  });

  const visiblePayouts = filteredPayouts.slice(0, visibleLimit);

  return (
    <div className="bg-white flex flex-col relative min-w-0 w-full h-full">
      {/* ── TOP HEADER (Identical to Invoices Page) ── */}
      <div className="relative overflow-hidden p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 bg-white">
        {/* Background mesh & grid */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-fuchsia-100/60 pointer-events-none z-0"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MCAwIEwgMCAwIDAgNDApIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMCwwLDAsMC4wMikiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4n)] opacity-85 pointer-events-none z-0"></div>
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-indigo-200/30 blur-[60px] rounded-full pointer-events-none z-0"></div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-300/30 blur-[60px] rounded-full pointer-events-none z-0"></div>

        <div className="relative z-10">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">
            {language === 'es' ? 'Pagos Masivos' : 'Mass Payout'}
          </h2>
          <p className="text-slate-500 font-medium text-xs">
            {language === 'es' 
              ? 'Dispersa pagos masivos por lotes en BEP-20 directamente desde tu billetera del sistema.' 
              : 'Disburse batch BEP-20 token payouts directly from your System Wallet.'}
          </p>
        </div>

        {/* Top Right Action Button in Purple Accent */}
        <button
          type="button"
          onClick={() => setActiveTab(activeTab === 'create' ? 'history' : 'create')}
          className="relative z-10 w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-[13px] hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-md shadow-purple-100 shrink-0"
        >
          {activeTab === 'create' ? (
            <>
              <Layers size={16} strokeWidth={1.5} />
              <span>{language === 'es' ? 'Historial de Lotes' : 'Batch History'}</span>
              <span className="bg-purple-800/40 text-white px-2 py-0.5 rounded-full text-[11px] font-bold">
                {payouts.length}
              </span>
            </>
          ) : (
            <>
              <Send size={16} strokeWidth={1.5} />
              <span>{language === 'es' ? 'Nuevo Envío Masivo' : 'New Mass Payout'}</span>
            </>
          )}
        </button>
      </div>

      {/* ── SYSTEM WALLET BALANCES & INLINE DEPOSIT (Clean & Spacious) ── */}
      <div className="p-6 md:p-8 bg-slate-50/40 border-b border-slate-100 space-y-5">
        {/* Row 1: 3 Coin Balances with Large Clean Typography and Icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* USDT Balance */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <img src="/coins/usdt.png" alt="USDT" className="w-10 h-10 object-contain shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  USDT {language === 'es' ? 'Saldo' : 'Balance'}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight block truncate">
                  ${systemWallet.usdtBalance}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-150 shrink-0 uppercase tracking-wider">
              BEP-20
            </span>
          </div>

          {/* USDC Balance */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <img src="/coins/usdc.png" alt="USDC" className="w-10 h-10 object-contain shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  USDC {language === 'es' ? 'Saldo' : 'Balance'}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight block truncate">
                  ${systemWallet.usdcBalance}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-150 shrink-0 uppercase tracking-wider">
              BEP-20
            </span>
          </div>

          {/* BNB Gas Reserve */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <img src="/coins/bnb.png" alt="BNB" className="w-10 h-10 object-contain shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  BNB Gas {language === 'es' ? 'Reserva' : 'Reserve'}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono tracking-tight block truncate">
                  {systemWallet.bnbBalance} <span className="text-xs font-normal text-slate-400">BNB</span>
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-150 shrink-0 uppercase tracking-wider">
              Gas Fee
            </span>
          </div>
        </div>

        {/* Row 2: Inline Deposit Bar with Copy & Always-Visible QR Code (No Modal) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {language === 'es' ? 'Dirección Única de Depósito (BEP-20)' : 'Deposit Wallet Address (BEP-20)'}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                ({language === 'es' ? 'Misma para USDT, USDC y BNB' : 'Shared for USDT, USDC & BNB Gas'})
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-50/70 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono">
              <span className="truncate select-all text-slate-800 font-semibold text-xs sm:text-sm flex-1" title={systemWallet.address}>
                {systemWallet.address || 'Loading...'}
              </span>

              <button
                type="button"
                onClick={handleCopyAddress}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition shrink-0"
              >
                {copiedAddress ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedAddress ? (language === 'es' ? 'Copiado' : 'Copied') : (language === 'es' ? 'Copiar' : 'Copy')}</span>
              </button>

              {systemWallet.address && (
                <a
                  href={`https://bscscan.com/address/${systemWallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-slate-400 hover:text-purple-600 transition shrink-0"
                  title="View on BscScan"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-[11px] text-slate-400 leading-normal">
                {language === 'es'
                  ? 'Transfiera fondos a esta dirección para habilitar dispersiones masivas. Los saldos se acreditan al instante.'
                  : 'Transfer funds to this address to enable payouts. Balances update immediately upon block confirmation.'}
              </p>

              <button 
                type="button"
                onClick={() => fetchPayouts(true)}
                disabled={refreshingWallet}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition shrink-0 ml-3"
                title="Refresh balances"
              >
                <RefreshCw size={12} className={refreshingWallet ? 'animate-spin text-purple-600' : ''} />
                <span>{language === 'es' ? 'Actualizar' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* Inline Visible QR Code */}
          <div className="shrink-0 flex items-center gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 self-stretch lg:self-auto justify-center">
            {systemWallet.address ? (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${systemWallet.address}`}
                alt="Deposit QR"
                className="w-20 h-20 rounded-lg bg-white p-1 border border-slate-200 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-20 h-20 bg-slate-200/60 rounded-lg animate-pulse shrink-0" />
            )}
            <div className="text-[11px] text-slate-500 font-medium">
              <span className="font-bold text-slate-800 block text-xs">{language === 'es' ? 'Escanear QR' : 'Scan to Deposit'}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">BSC BEP-20 Network</span>
              <span className="text-[9.5px] text-emerald-600 font-bold block mt-1">USDT &bull; USDC &bull; BNB</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB 1: SEND MASS PAYOUT ── */}
      {activeTab === 'create' && (
        <div className="flex flex-col">
          {/* Action & Filter Bar (Matching Invoices Filter Bar) */}
          <div className="px-6 md:px-8 py-5 bg-white border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
            {/* Left: Token Selection Pills */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
                {language === 'es' ? 'Moneda:' : 'Token:'}
              </span>
              {['USDT', 'USDC'].map(sym => {
                const coin = SUPPORTED_COINS.find(c => c.symbol === sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => setSelectedCoin(sym)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs border ${
                      selectedCoin === sym
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <img src={coin?.icon} alt={sym} className="w-4 h-4 object-contain" />
                    <span>{sym}</span>
                  </button>
                );
              })}
            </div>

            {/* Right: Input Mode & CSV Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center p-0.5 bg-slate-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setInputMode('manual')}
                  className={`px-3.5 py-1.5 rounded-lg transition ${
                    inputMode === 'manual' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  {language === 'es' ? 'Filas Manuales' : 'Manual Rows'}
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('bulk')}
                  className={`px-3.5 py-1.5 rounded-lg transition ${
                    inputMode === 'bulk' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  {language === 'es' ? 'Pegar CSV' : 'Paste CSV'}
                </button>
              </div>

              <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-xs">
                <Upload size={13} className="text-slate-400" />
                <span>{language === 'es' ? 'Subir CSV' : 'Upload CSV'}</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>

              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition shadow-xs"
                title="Download CSV sample"
              >
                <Download size={13} className="text-slate-400" />
                <span>{language === 'es' ? 'Plantilla' : 'Sample'}</span>
              </button>
            </div>
          </div>

          {/* Mode: MANUAL ROWS */}
          {inputMode === 'manual' && (
            <div>
              {/* Desktop Table View (Matching Invoices Table Layout) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-650">
                  <thead className="bg-white text-xs font-semibold text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-6 md:px-8 py-4 w-12">#</th>
                      <th className="px-6 md:px-8 py-4">{language === 'es' ? 'Dirección Destinatario (BEP-20)' : 'Recipient Wallet Address (BEP-20)'}</th>
                      <th className="px-6 md:px-8 py-4 w-44">{language === 'es' ? 'Monto' : 'Amount'} ({selectedCoin})</th>
                      <th className="px-6 md:px-8 py-4 w-60">{language === 'es' ? 'Nota / Memo (Opcional)' : 'Note / Memo (Optional)'}</th>
                      <th className="px-6 md:px-8 py-4 text-right w-16">{language === 'es' ? 'Acción' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recipients.map((r, index) => {
                      const isAddrValid = !r.address || ethers.isAddress(r.address.trim());
                      const isAmountValid = !r.amount || (!isNaN(parseFloat(r.amount)) && parseFloat(r.amount) > 0);

                      return (
                        <tr key={r.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 md:px-8 py-3.5 font-mono text-xs text-slate-400 font-bold">
                            {index + 1}
                          </td>
                          <td className="px-6 md:px-8 py-3.5">
                            <input
                              type="text"
                              placeholder="0x..."
                              value={r.address}
                              onChange={(e) => handleRowChange(r.id, 'address', e.target.value)}
                              className={`w-full px-4 py-2 border rounded-xl text-xs font-mono transition focus:outline-none ${
                                isAddrValid
                                  ? 'border-slate-200 bg-white hover:bg-slate-50/50 focus:border-slate-400 text-slate-800'
                                  : 'border-rose-300 bg-rose-50/40 text-rose-900'
                              }`}
                            />
                          </td>
                          <td className="px-6 md:px-8 py-3.5">
                            <div className="relative">
                              <input
                                type="number"
                                step="any"
                                placeholder="0.00"
                                value={r.amount}
                                onChange={(e) => handleRowChange(r.id, 'amount', e.target.value)}
                                className={`w-full px-4 py-2 pr-12 border rounded-xl text-xs font-semibold transition focus:outline-none ${
                                  isAmountValid
                                    ? 'border-slate-200 bg-white hover:bg-slate-50/50 focus:border-slate-400 text-slate-900'
                                    : 'border-rose-300 bg-rose-50/40 text-rose-900'
                                }`}
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 pointer-events-none uppercase">
                                {selectedCoin}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 md:px-8 py-3.5">
                            <input
                              type="text"
                              placeholder={language === 'es' ? 'Ej. Salario, Recompensa...' : 'e.g. Salary, Reward...'}
                              value={r.memo}
                              onChange={(e) => handleRowChange(r.id, 'memo', e.target.value)}
                              className="w-full px-4 py-2 border border-slate-200 rounded-xl text-xs bg-white hover:bg-slate-50/50 focus:outline-none focus:border-slate-400 text-slate-700 transition"
                            />
                          </td>
                          <td className="px-6 md:px-8 py-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(r.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                              title="Delete row"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (Matching Invoices Mobile View) */}
              <div className="block md:hidden divide-y divide-slate-100">
                {recipients.map((r, index) => {
                  const isAddrValid = !r.address || ethers.isAddress(r.address.trim());
                  const isAmountValid = !r.amount || (!isNaN(parseFloat(r.amount)) && parseFloat(r.amount) > 0);

                  return (
                    <div key={r.id} className="p-4 space-y-2.5 bg-white">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-slate-400">#{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(r.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          {language === 'es' ? 'Dirección' : 'Address'}
                        </span>
                        <input
                          type="text"
                          placeholder="0x..."
                          value={r.address}
                          onChange={(e) => handleRowChange(r.id, 'address', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-xl text-xs font-mono focus:outline-none ${
                            isAddrValid ? 'border-slate-200 bg-white' : 'border-rose-300 bg-rose-50/40'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            {language === 'es' ? 'Monto' : 'Amount'} ({selectedCoin})
                          </span>
                          <input
                            type="number"
                            step="any"
                            placeholder="0.00"
                            value={r.amount}
                            onChange={(e) => handleRowChange(r.id, 'amount', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-xl text-xs font-semibold focus:outline-none ${
                              isAmountValid ? 'border-slate-200 bg-white' : 'border-rose-300 bg-rose-50/40'
                            }`}
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Memo
                          </span>
                          <input
                            type="text"
                            placeholder="Note"
                            value={r.memo}
                            onChange={(e) => handleRowChange(r.id, 'memo', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Recipient Row Action Bar */}
              <div className="px-6 md:px-8 py-4 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-purple-600 font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus size={14} />
                  <span>{language === 'es' ? 'Agregar Destinatario' : 'Add Recipient'}</span>
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  {validRecipients.length} / {recipients.length} {language === 'es' ? 'destinatarios válidos' : 'valid recipients'}
                </span>
              </div>
            </div>
          )}

          {/* Mode: BULK CSV PASTE */}
          {inputMode === 'bulk' && (
            <div className="p-6 md:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">
                  {language === 'es'
                    ? 'Pegue texto en formato CSV: dirección, monto, memo (una línea por cada destinatario).'
                    : 'Paste formatted CSV text: address, amount, memo (one line per recipient).'}
                </p>
                <button
                  type="button"
                  onClick={() => setBulkText('')}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  {language === 'es' ? 'Limpiar' : 'Clear'}
                </button>
              </div>

              <textarea
                rows={8}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`0x71C8705775502e33644243b95a04381cf3a60a88, 50.00, Affiliate Reward\n0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1, 120.50, Monthly Bonus`}
                className="w-full text-xs font-mono p-4 bg-slate-50/50 rounded-2xl border border-slate-200 focus:bg-white focus:outline-none focus:border-slate-400 transition leading-relaxed"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleParseBulk}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition shadow-xs"
                >
                  {language === 'es' ? 'Cargar a la Tabla' : 'Load into Table'}
                </button>
              </div>
            </div>
          )}

          {/* ── BOTTOM SUMMARY & EXECUTE BAR (Matching Invoices Style) ── */}
          <div className="p-6 md:p-8 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'es' ? 'Total a Dispersar:' : 'Total Payout Amount:'}
                </span>
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {totalPayoutAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase">{selectedCoin}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{validRecipients.length} {language === 'es' ? 'destinatarios' : 'recipients'}</span>
                <span>&bull;</span>
                <span>Gas: ~{estimatedGasFee}</span>
                {hasInsufficientToken && (
                  <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {language === 'es' ? 'Saldo insuficiente' : 'Insufficient token balance'}
                  </span>
                )}
                {hasInsufficientGas && (
                  <span className="text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    {language === 'es' ? 'Gas insuficiente' : 'Insufficient gas balance'}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleReviewPayout}
              disabled={validRecipients.length === 0}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-[13px] hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-md shadow-purple-100 shrink-0 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              <Send size={15} strokeWidth={1.5} />
              <span>{language === 'es' ? 'Revisar y Enviar' : 'Review & Send'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2: BATCH HISTORY (Matching Invoices Page Filter & Table) ── */}
      {activeTab === 'history' && (
        <div className="flex flex-col">
          {/* History Filter Bar (Exact Match with Invoices Filter Bar) */}
          <div className="px-6 md:px-8 py-5 bg-slate-50/40 border-b border-slate-100 flex flex-col gap-4 relative">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
              {/* Left: Search Input */}
              <div className="w-full sm:w-80 shrink-0">
                <input 
                  type="text" 
                  placeholder={language === 'es' ? 'Buscar Batch ID o Tx Hash...' : 'Search Batch ID or Tx Hash...'} 
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  className="w-full px-5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-0 focus:border-slate-200 text-slate-700 bg-white hover:bg-slate-50/50 transition shadow-sm text-sm"
                />
              </div>

              {/* Right: Actions */}
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
                      <div className="fixed inset-0 z-10 bg-slate-900/10 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none" onClick={() => setShowFilters(false)} />
                      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2.5rem)] max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-5 z-20 space-y-4 text-left animate-fadeIn md:absolute md:top-auto md:left-auto md:right-0 md:transform-none md:w-96 md:mt-2">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{language === 'es' ? 'Filtrar Lotes' : 'Filter Batches'}</h4>
                          <button 
                            type="button" 
                            onClick={() => setShowFilters(false)}
                            className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-100 rounded-lg"
                          >
                            <X size={15} strokeWidth={2.5} />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider">{language === 'es' ? 'Estado' : 'Status'}</span>
                            <select 
                              value={statusFilter}
                              onChange={(e) => setStatusFilter(e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-xs font-semibold text-slate-700 shadow-sm"
                            >
                              <option value="All">{language === 'es' ? 'Todos' : 'All Statuses'}</option>
                              <option value="Completed">{language === 'es' ? 'Completados' : 'Completed'}</option>
                              <option value="Processing">{language === 'es' ? 'En Proceso' : 'Processing'}</option>
                              <option value="Failed">{language === 'es' ? 'Fallidos' : 'Failed'}</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider">Token</span>
                            <select 
                              value={coinFilter}
                              onChange={(e) => setCoinFilter(e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-200 bg-white rounded-xl focus:outline-none text-xs font-semibold text-slate-700 shadow-sm"
                            >
                              <option value="All">{language === 'es' ? 'Todos' : 'All Coins'}</option>
                              <option value="USDT">USDT</option>
                              <option value="USDC">USDC</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 tracking-wider">{language === 'es' ? 'Fecha' : 'Date'}</span>
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

                        <div className="pt-3 flex justify-end border-t border-slate-100">
                          <button 
                            type="button" 
                            onClick={() => {
                              setStatusFilter('All');
                              setCoinFilter('All');
                              setDateFilter('All');
                              setSearchHistory('');
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
                    const toastId = toast.loading(language === 'es' ? 'Actualizando lotes...' : 'Refreshing batches...');
                    fetchPayouts().then(() => toast.success(language === 'es' ? '¡Datos actualizados!' : 'Data refreshed!', { id: toastId }));
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                  title="Refresh Data"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                  <span>{language === 'es' ? 'Actualizar' : 'Refresh'}</span>
                </button>

                <button 
                  onClick={handleExportHistoryCSV}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100/70 hover:text-emerald-800 text-sm font-bold rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Download size={14} strokeWidth={2} className="text-emerald-600" />
                  <span>{language === 'es' ? 'Exportar CSV' : 'Export CSV'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="p-8 space-y-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-2xl w-full"></div>
              ))}
            </div>
          ) : filteredPayouts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 py-16">
              <p className="mb-2 font-semibold">{language === 'es' ? 'No se encontraron lotes de pago.' : 'No payout batches found matching criteria.'}</p>
              <p className="text-sm text-slate-400">{language === 'es' ? 'Intente modificar su consulta de búsqueda o las opciones de filtro.' : 'Try modifying your search query or filter options.'}</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View (Matching Invoices Mobile View) */}
              <div className="block md:hidden divide-y divide-slate-100 overflow-hidden">
                {visiblePayouts.map((batch) => (
                  <div key={batch.batchId} className="p-5 space-y-3 bg-white hover:bg-slate-50/50 transition">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-slate-800 text-[13.5px] font-mono">
                        {batch.batchId}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(batch.status)}`}>
                        {batch.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-end pt-1">
                      <div className="space-y-1">
                        <p className="text-[11px] text-slate-500 font-semibold">
                          {batch.recipientsCount} {language === 'es' ? 'destinatarios' : 'recipients'}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(batch.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">{language === 'es' ? 'Monto Total' : 'Total Amount'}</span>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[13px] font-bold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-150">
                            {batch.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {batch.coin}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">BSC (BEP20)</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBatchDetails(batch)}
                        className="flex-1 justify-center inline-flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-bold bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition text-xs shadow-sm border border-slate-200/40"
                      >
                        <FileText size={13} />
                        <span>{language === 'es' ? 'Ver Detalles' : 'View Details'}</span>
                      </button>
                      {batch.txHash && (
                        <a
                          href={`https://bscscan.com/tx/${batch.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 justify-center inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-bold bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition text-xs shadow-sm border border-emerald-200/40"
                        >
                          <Link2 size={13} />
                          <span>{language === 'es' ? 'Ver en BscScan' : 'BscScan'}</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View (Matching Invoices Desktop Table View) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-650">
                  <thead className="bg-white text-xs font-semibold text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-5 md:px-8 py-4 md:py-5">{language === 'es' ? 'Detalles del Lote' : 'Batch Details'}</th>
                      <th className="px-5 md:px-8 py-4 md:py-5">{language === 'es' ? 'Destinatarios' : 'Recipients'}</th>
                      <th className="px-5 md:px-8 py-4 md:py-5">{language === 'es' ? 'Monto Total' : 'Total Amount'}</th>
                      <th className="px-5 md:px-8 py-4 md:py-5">Token</th>
                      <th className="px-5 md:px-8 py-4 md:py-5">{language === 'es' ? 'Estado' : 'Status'}</th>
                      <th className="px-5 md:px-8 py-4 md:py-5">{language === 'es' ? 'Fecha' : 'Date'}</th>
                      <th className="px-5 md:px-8 py-4 md:py-5 text-right">{language === 'es' ? 'Acción' : 'Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visiblePayouts.map((batch) => (
                      <tr key={batch.batchId} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 md:px-8 py-4 md:py-5 font-medium text-slate-800 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-900 text-[13.5px] font-mono">{batch.batchId}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Sender: {batch.senderWallet ? `${batch.senderWallet.slice(0, 10)}...${batch.senderWallet.slice(-6)}` : 'System Gas Wallet'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 md:px-8 py-4 md:py-5 font-medium text-slate-700 whitespace-nowrap">
                          <span className="font-bold text-slate-900">{batch.recipientsCount}</span> {language === 'es' ? 'destinatarios' : 'wallets'}
                        </td>
                        <td className="px-5 md:px-8 py-4 md:py-5 font-bold text-slate-900 whitespace-nowrap">
                          {batch.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-5 md:px-8 py-4 md:py-5 font-medium text-slate-700 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-800 text-xs font-semibold">{batch.coin}</span>
                            <span className="text-slate-400 text-[10px] font-medium">BSC (BEP20)</span>
                          </div>
                        </td>
                        <td className="px-5 md:px-8 py-4 md:py-5 whitespace-nowrap">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(batch.status)}`}>
                            {batch.status}
                          </span>
                        </td>
                        <td className="px-5 md:px-8 py-4 md:py-5 font-medium text-slate-555 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-slate-700 text-xs font-semibold">{new Date(batch.createdAt).toLocaleDateString()}</span>
                            <span className="text-slate-400 text-[10px] font-medium">
                              {new Date(batch.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 md:px-8 py-4 md:py-5 text-right whitespace-nowrap">
                          <div className="flex justify-end items-center gap-2">
                            {batch.txHash && (
                              <a
                                href={`https://bscscan.com/tx/${batch.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-bold bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition text-xs border border-emerald-100"
                                title="View on BscScan"
                              >
                                {language === 'es' ? 'Enlace Tx' : 'BscScan'} <Link2 size={12} />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedBatchDetails(batch)}
                              className="inline-flex items-center gap-1 text-slate-655 hover:text-slate-900 font-semibold bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition text-xs border border-slate-200/40"
                            >
                              <FileText size={13} />
                              <span>{language === 'es' ? 'Detalles' : 'Details'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExportBatchCSV(batch)}
                              className="inline-flex items-center gap-1 text-slate-655 hover:text-slate-900 font-semibold bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition text-xs border border-slate-200/40"
                              title="Export CSV"
                            >
                              <Download size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Show More Pagination Button (Matching Invoices Page) */}
              {filteredPayouts.length > visibleLimit && (
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
      )}

      {/* ── REVIEW & CONFIRMATION MODAL ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-slate-150 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                {language === 'es' ? 'Confirmar Dispersión Masiva' : 'Confirm Mass Payout'}
              </h3>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'es' ? 'Destinatarios' : 'Recipients'}
                </span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                  {validRecipients.length} wallets
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'es' ? 'Monto Total' : 'Total Amount'}
                </span>
                <span className="text-base font-extrabold text-slate-900 mt-0.5 block">
                  {totalPayoutAmount.toFixed(2)} {selectedCoin}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {language === 'es' ? 'Est. Gas BNB' : 'Est. Gas Fee'}
                </span>
                <span className="text-base font-mono font-bold text-emerald-600 mt-0.5 block">
                  {estimatedGasFee}
                </span>
              </div>
            </div>

            <div className="border border-slate-200/80 rounded-xl overflow-hidden">
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 text-xs">
                {validRecipients.map((r, i) => (
                  <div key={i} className="p-2.5 flex justify-between items-center bg-white hover:bg-slate-50/50">
                    <div className="min-w-0 pr-3">
                      <span className="font-mono text-slate-800 text-[11px] block truncate">{r.address}</span>
                      {r.memo && <span className="text-[10px] text-slate-400 italic block">{r.memo}</span>}
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">{r.amount} {selectedCoin}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleExecutePayout}
                disabled={submitting}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md shadow-purple-100 disabled:bg-slate-300"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>{language === 'es' ? 'Dispersando...' : 'Executing...'}</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>{language === 'es' ? 'Confirmar y Enviar' : 'Confirm & Execute'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BATCH DETAILS MODAL ── */}
      {selectedBatchDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl p-6 shadow-2xl border border-slate-150 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  {selectedBatchDetails.batchId}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base mt-1.5">
                  {selectedBatchDetails.totalAmount} {selectedBatchDetails.coin} &bull; {selectedBatchDetails.recipientsCount} {language === 'es' ? 'destinatarios' : 'recipients'}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedBatchDetails(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3.5">#</th>
                    <th className="py-2.5 px-3.5">{language === 'es' ? 'Billetera' : 'Wallet'}</th>
                    <th className="py-2.5 px-3.5">{language === 'es' ? 'Monto' : 'Amount'}</th>
                    <th className="py-2.5 px-3.5">Memo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedBatchDetails.recipients || []).map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3.5 text-slate-400 font-mono text-[11px]">{i + 1}</td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-800 text-xs select-all">{r.address}</td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">{r.amount} {selectedBatchDetails.coin}</td>
                      <td className="py-2.5 px-3.5 text-slate-500 italic text-[11px]">{r.memo || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleExportBatchCSV(selectedBatchDetails)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition shadow-xs"
              >
                <Download size={13} />
                <span>{language === 'es' ? 'Exportar CSV' : 'Export CSV'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedBatchDetails(null)}
                className="px-5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition shadow-xs"
              >
                {language === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
