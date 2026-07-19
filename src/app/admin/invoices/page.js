"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Search, ExternalLink, Calendar, Layers, ShieldCheck, Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminInvoices() {
  const { language } = useLanguage();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const t = (en, es) => (language === 'es' ? es : en);

  const handleExportCSV = () => {
    if (invoices.length === 0) {
      toast.error(language === 'es' ? 'No hay registros para exportar' : 'No records to export');
      return;
    }

    const headers = [
      'Invoice ID',
      'Merchant Name',
      'Merchant Email',
      'Order ID',
      'Description',
      'Customer Name',
      'Customer Email',
      'Fiat Amount',
      'Currency',
      'USDT Amount',
      'Coin',
      'Network',
      'Wallet Address',
      'Status',
      'Transaction Hash',
      'Created At'
    ];
    
    const rows = invoices.map(inv => [
      inv._id,
      inv.merchantId?.businessName ? `"${inv.merchantId.businessName.replace(/"/g, '""')}"` : '',
      inv.merchantId?.email ? `"${inv.merchantId.email.replace(/"/g, '""')}"` : '',
      inv.orderId ? `"${inv.orderId.replace(/"/g, '""')}"` : '',
      inv.description ? `"${inv.description.replace(/"/g, '""')}"` : '',
      inv.customerName ? `"${inv.customerName.replace(/"/g, '""')}"` : '',
      inv.customerEmail ? `"${inv.customerEmail.replace(/"/g, '""')}"` : '',
      inv.amount || 0,
      inv.currency || 'USD',
      inv.usdtAmount || 0,
      inv.coin || 'USDT',
      inv.network || 'BEP20',
      inv.walletAddress || '',
      inv.status || '',
      inv.transactionHash || '',
      inv.createdAt ? new Date(inv.createdAt).toISOString() : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
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

  const fetchInvoices = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (status && status !== 'all') query.append('status', status);
    if (search) query.append('search', search);

    fetch(`/api/admin/invoices?${query.toString()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setInvoices(data.invoices || []);
        }
      })
      .catch(err => console.error('Error fetching admin invoices:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchInvoices();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, status]);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t('Global Invoice Audit Logs', 'Registros de Auditoría de Facturas')}</h2>
          <p className="text-xs text-slate-400 font-medium">{t('Audit real-time transaction updates, blockchain explorer hashes, and swept statuses.', 'Audite las actualizaciones de transacciones en tiempo real, los hash del explorador de blockchain y los estados de barrido.')}</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Download size={14} className="text-emerald-600 font-bold" />
          {language === 'es' ? 'Exportar CSV' : 'Export CSV'}
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 border border-slate-200/60 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t('Search by Tx Hash, Custom ID, client email...', 'Buscar por Hash de Tx, ID personalizado, email...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none text-slate-700 bg-slate-50/50 hover:bg-slate-50 transition text-xs font-semibold"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none text-slate-700 bg-slate-50/50 hover:bg-slate-50 transition text-xs font-bold"
          >
            <option value="all">{t('All Statuses', 'Todos los Estados')}</option>
            <option value="Pending">{t('Pending', 'Pendiente')}</option>
            <option value="Processing">{t('Processing', 'Procesando')}</option>
            <option value="Paid">{t('Paid', 'Pagado')}</option>
            <option value="Overpaid">{t('Overpaid', 'Sobrepagado')}</option>
            <option value="Partially Paid">{t('Partially Paid', 'Pago Parcial')}</option>
            <option value="Expired">{t('Expired', 'Expirado')}</option>
            <option value="Refunded">{t('Refunded', 'Reembolsado')}</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-purple-650 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-500">{t('Filtering invoices...', 'Filtrando facturas...')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                  <th className="px-6 py-4">{t('Merchant', 'Comercio')}</th>
                  <th className="px-6 py-4">{t('Order Info', 'Detalles del Pedido')}</th>
                  <th className="px-6 py-4">{t('Customer', 'Cliente')}</th>
                  <th className="px-6 py-4">{t('Fiat Amount', 'Monto Fiat')}</th>
                  <th className="px-6 py-4">{t('Crypto Paid', 'Pago Cripto')}</th>
                  <th className="px-6 py-4">{t('Payment Wallet', 'Billetera de Pago')}</th>
                  <th className="px-6 py-4 text-center">{t('Status', 'Estado')}</th>
                  <th className="px-6 py-4">{t('Tx Hash (Sweep)', 'Hash Tx (Barrido)')}</th>
                  <th className="px-6 py-4">{t('Created At', 'Creado el')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-sm font-semibold text-slate-400 bg-slate-50/20">
                      {t('No invoices match the selected parameters.', 'Ninguna factura coincide con los parámetros.')}
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4.5">
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{inv.merchantId?.businessName || t('Deleted Merchant', 'Comercio Eliminado')}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{inv.merchantId?.email || ''}</p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5 select-all">ID: {inv.merchantId?._id || ''}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 font-medium">
                        <div className="space-y-0.5">
                          <p className="text-slate-800 text-xs font-bold">{t('Order', 'Orden')}: {inv.orderId}</p>
                          {inv.description && <p className="text-[10px] text-slate-400 truncate max-w-xs">{inv.description}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="space-y-0.5">
                          {inv.customerName && <p className="text-slate-800 text-xs font-bold">{inv.customerName}</p>}
                          <p className="text-xs font-semibold text-slate-600 font-mono">{inv.customerEmail || '—'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="text-xs font-semibold text-slate-800">${(inv.amount || 0).toFixed(2)} {inv.currency || 'USD'}</span>
                      </td>
                      <td className="px-6 py-4.5">
                        <div>
                          <p className="text-xs font-extrabold text-slate-800">
                            {inv.usdtAmount ? inv.usdtAmount.toFixed(4) : (inv.amount || 0).toFixed(4)} {inv.coin || 'USDT'}
                          </p>
                          <p className="text-[9px] text-slate-450 font-bold uppercase mt-0.5">
                            {inv.network || 'BEP20'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-1 font-mono">
                          <code className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md font-mono" title={inv.walletAddress}>
                            {inv.walletAddress ? `${inv.walletAddress.substring(0, 6)}...${inv.walletAddress.substring(inv.walletAddress.length - 4)}` : '—'}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(inv.walletAddress);
                              toast.success(t('Copied to clipboard!', '¡Copiado al portapapeles!'));
                            }}
                            className="p-1 text-slate-400 hover:text-purple-600 transition shrink-0"
                            title={t('Copy Full Address', 'Copiar Dirección Completa')}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-center">
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
                        {inv.transactionHash ? (
                          <div className="flex items-center gap-1">
                            <a
                              href={`https://bscscan.com/tx/${inv.transactionHash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-purple-650 hover:text-purple-700 hover:underline font-mono"
                              title={inv.transactionHash}
                            >
                              {inv.transactionHash.substring(0, 8)}...{inv.transactionHash.substring(inv.transactionHash.length - 6)}
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(inv.transactionHash);
                                toast.success(t('Copied to clipboard!', '¡Copiado al portapapeles!'));
                              }}
                              className="p-1 text-slate-400 hover:text-purple-600 transition"
                            >
                              <Copy size={10} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-350 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5 font-mono text-[10px] text-slate-500">
                        {new Date(inv.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
