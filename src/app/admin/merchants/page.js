"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, ShieldAlert, ExternalLink, Mail, Ban, CheckCircle, Search, Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminMerchants() {
  const { language } = useLanguage();
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  
  // Search & Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const t = (en, es) => (language === 'es' ? es : en);

  const handleExportCSV = () => {
    if (filteredMerchants.length === 0) {
      toast.error(language === 'es' ? 'No hay registros para exportar' : 'No records to export');
      return;
    }

    const headers = ['Merchant ID', 'Business Name', 'Email', 'Website', 'System Wallet', 'Invoice Count', 'Total Volume', 'Email Verified', 'Blocked Status', 'Registration Date'];
    
    const rows = filteredMerchants.map(m => [
      m._id,
      m.businessName ? `"${m.businessName.replace(/"/g, '""')}"` : '',
      m.email ? `"${m.email.replace(/"/g, '""')}"` : '',
      m.website ? `"${m.website.replace(/"/g, '""')}"` : '',
      m.systemWalletAddress || '',
      m.invoiceCount || 0,
      m.volume || 0,
      m.isEmailVerified ? 'Yes' : 'No',
      m.isBlocked ? 'Blocked' : 'Active',
      m.createdAt ? new Date(m.createdAt).toISOString() : ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `merchants_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(language === 'es' ? '¡Comercios exportados con éxito!' : 'Merchants exported successfully!');
  };

  const fetchMerchants = () => {
    fetch('/api/admin/merchants', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMerchants(data.merchants || []);
        }
      })
      .catch(err => console.error('Error fetching admin merchants:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const handleToggleBlock = async (id, currentBlockedStatus) => {
    setUpdatingId(id);
    const toastId = toast.loading(t('Updating merchant status...', 'Actualizando estado del comercio...'));
    try {
      const res = await fetch('/api/admin/merchants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId: id, isBlocked: !currentBlockedStatus })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t('Merchant status updated successfully!', '¡Estado del comercio actualizado con éxito!'), { id: toastId });
        fetchMerchants();
      } else {
        toast.error(data.error || t('Failed to update status', 'Error al actualizar el estado'), { id: toastId });
      }
    } catch {
      toast.error(t('Network error occurred', 'Ocurrió un error de red'), { id: toastId });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-purple-650 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">{t('Loading merchants list...', 'Cargando lista de comercios...')}</p>
      </div>
    );
  }

  const filteredMerchants = merchants.filter(merchant => {
    if (statusFilter === 'blocked' && !merchant.isBlocked) return false;
    if (statusFilter === 'verified' && (!merchant.isEmailVerified || merchant.isBlocked)) return false;
    if (statusFilter === 'unverified' && merchant.isEmailVerified) return false;

    if (search.trim()) {
      const term = search.toLowerCase();
      const matchesName = merchant.businessName?.toLowerCase().includes(term);
      const matchesEmail = merchant.email?.toLowerCase().includes(term);
      const matchesWallet = merchant.systemWalletAddress?.toLowerCase().includes(term);
      return matchesName || matchesEmail || matchesWallet;
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">{t('Platform Merchants', 'Comercios de la Plataforma')}</h2>
          <p className="text-xs text-slate-400 font-medium">{t('Manage merchant registration details, suspend access, and audit business operations.', 'Administre los detalles de registro del comercio, suspenda el acceso y audite las operaciones comerciales.')}</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <Download size={14} className="text-emerald-600 font-bold" />
          {language === 'es' ? 'Exportar CSV' : 'Export CSV'}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 border border-slate-200/60 rounded-2xl shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder={t('Search by Name, Email, Wallet...', 'Buscar por Nombre, Email, Billetera...')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none text-slate-700 bg-slate-50/50 hover:bg-slate-50 transition text-xs font-semibold"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none text-slate-700 bg-slate-50/50 hover:bg-slate-50 transition text-xs font-bold"
          >
            <option value="all">{t('All Statuses', 'Todos los Estados')}</option>
            <option value="verified">{t('Verified', 'Verificados')}</option>
            <option value="unverified">{t('Unverified', 'Sin Verificar')}</option>
            <option value="blocked">{t('Blocked', 'Bloqueados')}</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">
                <th className="px-6 py-4">{t('Business', 'Empresa')}</th>
                <th className="px-6 py-4">{t('System Wallet', 'Billetera del Sistema')}</th>
                <th className="px-6 py-4 text-center">{t('Invoices', 'Facturas')}</th>
                <th className="px-6 py-4 text-right">{t('Volume', 'Volumen')}</th>
                <th className="px-6 py-4 text-center">{t('Status', 'Estado')}</th>
                <th className="px-6 py-4 text-center">{t('Actions', 'Acciones')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMerchants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm font-semibold text-slate-400 bg-slate-50/20">
                    {t('No merchants found matching the parameters.', 'No se encontraron comercios que coincidan con los parámetros.')}
                  </td>
                </tr>
              ) : (
                filteredMerchants.map((merchant) => (
                  <tr key={merchant._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                          {merchant.logo ? (
                            <img src={merchant.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            merchant.businessName.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-xs">{merchant.businessName}</p>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400 font-semibold">
                            <span className="flex items-center gap-0.5"><Mail size={10} /> {merchant.email}</span>
                            {merchant.website && (
                              <a href={merchant.website} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline flex items-center gap-0.5">
                                <ExternalLink size={10} /> {t('Website', 'Sitio Web')}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      {merchant.systemWalletAddress ? (
                        <div className="flex items-center gap-1.5 font-mono">
                          <code className="text-[10px] text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 select-all shadow-sm break-all font-mono">
                            {merchant.systemWalletAddress}
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(merchant.systemWalletAddress);
                              toast.success(t('Copied to clipboard!', '¡Copiado al portapapeles!'));
                            }}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition shrink-0"
                            title={t('Copy Full Address', 'Copiar Dirección Completa')}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-350 italic">{t('No Wallet', 'Sin Billetera')}</span>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <span className="text-xs font-bold text-slate-700">{merchant.invoiceCount || 0}</span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <span className="text-xs font-extrabold text-slate-900">${(merchant.volume || 0).toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                        merchant.isBlocked
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : merchant.isEmailVerified
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-slate-55 text-slate-400 border-slate-200'
                      }`}>
                        {merchant.isBlocked
                          ? t('Blocked', 'Bloqueado')
                          : merchant.isEmailVerified
                          ? t('Verified', 'Verificado')
                          : t('Unverified', 'Sin Verificar')}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-center">
                      <button
                        onClick={() => handleToggleBlock(merchant._id, merchant.isBlocked)}
                        disabled={updatingId === merchant._id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition shadow-sm ${
                          merchant.isBlocked
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-emerald-50/50'
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100 shadow-rose-50/50'
                        }`}
                      >
                        {merchant.isBlocked ? (
                          <>
                            <CheckCircle size={12} />
                            {t('Unblock', 'Desbloquear')}
                          </>
                        ) : (
                          <>
                            <Ban size={12} />
                            {t('Block', 'Bloquear')}
                          </>
                        )}
                      </button>
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
