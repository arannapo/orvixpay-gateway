"use client";

import { useEffect, useState, use } from "react";
import { Copy, RefreshCw, Clock } from "lucide-react";
import toast from 'react-hot-toast';

export default function InvoicePage({ params }) {
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!invoice || !invoice.expiresAt) return;
    
    if (invoice.status !== 'Pending') {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(invoice.expiresAt).getTime() - new Date().getTime();
      const totalDuration = new Date(invoice.expiresAt).getTime() - new Date(invoice.createdAt).getTime();

      if (difference > 0) {
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        
        if (totalDuration > 0) {
          setProgress(Math.max(0, (difference / totalDuration) * 100));
        }
      } else {
        setTimeLeft('00:00');
        setProgress(0);
        if (invoice.status === 'Pending') {
          setInvoice(prev => ({ ...prev, status: 'Expired' }));
        }
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [invoice]);

  useEffect(() => {
    fetchInvoice();
    // Setting up polling for real-time status updates (every 5 seconds)
    const interval = setInterval(fetchInvoice, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoice/${id}`);
      const data = await res.json();
      if (data.success) {
        setInvoice(data.invoice);
      }
    } catch (error) {
      console.error("Error fetching invoice", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4 font-sans">
        {/* Decorative Background Glows */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/50 blur-[120px]" />
          <div className="absolute -bottom-[10%] -right-[5%] w-[50%] h-[50%] rounded-full bg-fuchsia-200/40 blur-[120px]" />
          <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-cyan-200/40 blur-[100px]" />
        </div>
        
        <div className="w-full max-w-[480px] z-10 relative">
          <div className="bg-white/40 rounded-[2rem] p-6 shadow-sm border border-slate-200/50 relative overflow-hidden animate-pulse">
            <div className="flex justify-between items-start mb-4 border-b border-slate-200/50 pb-4">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-200/60" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-slate-200/60 rounded" />
                    <div className="h-2 w-32 bg-slate-200/60 rounded" />
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end space-y-2">
                <div className="h-2 w-12 bg-slate-200/60 rounded" />
                <div className="h-3 w-16 bg-slate-200/60 rounded" />
                <div className="h-5 w-16 bg-slate-200/60 rounded-full" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center gap-4 px-1 mb-2">
                <div className="space-y-3">
                  <div className="h-3 w-20 bg-slate-200/60 rounded" />
                  <div className="h-10 w-32 bg-slate-200/60 rounded" />
                </div>
                <div className="w-24 h-24 bg-slate-200/60 rounded-xl" />
              </div>
              
              <div className="px-1 mt-4 space-y-2">
                <div className="h-3 w-32 bg-slate-200/60 rounded" />
                <div className="h-10 w-full bg-slate-200/60 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Invoice not found or expired.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes textureScroll {
          0% { background-position: 0px 0px; }
          100% { background-position: 32px 32px; }
        }
        .animate-blob { animation: blob 10s infinite alternate ease-in-out; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-texture { animation: textureScroll 15s linear infinite; }
      `}} />
      
      {/* Moving Texture Overlay */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none animate-texture opacity-60" 
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(148, 163, 184, 0.25) 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}
      />

      {/* Decorative Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/50 blur-[120px] animate-blob" />
        <div className="absolute -bottom-[10%] -right-[5%] w-[50%] h-[50%] rounded-full bg-fuchsia-200/40 blur-[120px] animate-blob animation-delay-2000" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-cyan-200/40 blur-[100px] animate-blob animation-delay-4000" />
      </div>
      
      <div className="w-full max-w-[480px] z-10 relative">
        <div className="bg-white rounded-[2.25rem] p-7 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden">
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-1 pb-1">
              <div>
                <div className="flex items-center gap-3.5 mb-2">
                  <img src={invoice.merchantId?.logo || "/logo.PNG"} alt="Merchant Logo" className="w-12 h-12 rounded-2xl object-contain bg-slate-50 border border-slate-200/60 p-1.5 shadow-sm" />
                  <div>
                    <span className="block font-bold text-slate-800 tracking-tight text-sm leading-tight">{invoice.merchantId?.businessName || 'Merchant Inc.'}</span>
                    {invoice.merchantId?.website && (
                      <a 
                        href={invoice.merchantId.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block text-[10.5px] text-slate-400 font-semibold hover:text-purple-600 transition-colors w-max mt-0.5"
                      >
                        {invoice.merchantId.website}
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right flex flex-col items-end shrink-0">
                <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm border ${
                  invoice.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200/40' :
                  invoice.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/40' :
                  invoice.status === 'Expired' ? 'bg-rose-50 text-rose-700 border-rose-200/40' :
                  'bg-slate-50 text-slate-700 border-slate-200/40'
                }`}>
                  {invoice.status}
                </span>
                {timeLeft && invoice.status === 'Pending' && (
                  <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100/80 shadow-sm animate-pulse">
                    <Clock size={11} strokeWidth={2.5} />
                    <span>{timeLeft}</span>
                  </div>
                )}
              </div>
            </div>

            {timeLeft && invoice.status === 'Pending' && (
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden shrink-0 mb-6 mt-3">
                <div 
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-1000 ease-linear relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent to-white/20 animate-pulse"></div>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {/* Amount & QR Box */}
              <div className="flex justify-between items-center gap-4 bg-slate-50/50 border border-slate-100 p-4 rounded-[1.5rem] mt-3">
                <div>
                  <p className="text-slate-400 text-[10.5px] font-bold uppercase tracking-wider mb-1 font-sans">
                    {invoice.status === 'Partially Paid' ? 'Remaining Balance' : 'Amount Due'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <img 
                      src={`/coins/${invoice.coin?.toLowerCase()}.png`} 
                      alt={invoice.coin} 
                      className="w-6 h-6 object-contain shrink-0" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <span className="text-4xl font-extrabold tracking-tight text-slate-800 leading-none">
                      {invoice.status === 'Partially Paid' 
                        ? (invoice.usdtAmount - (invoice.receivedAmount || 0)).toFixed(2)
                        : (invoice.usdtAmount || '0.00')}
                    </span>
                    <span className="text-slate-500 font-bold text-sm">{invoice.coin}</span>
                  </div>
                  {invoice.status === 'Partially Paid' && (
                    <p className="text-[10px] text-slate-500 font-bold mt-1.5">
                      Received {invoice.receivedAmount} of {invoice.usdtAmount} {invoice.coin}
                    </p>
                  )}
                </div>
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200/60 shrink-0">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${invoice.walletAddress}`} alt="Payment QR Code" className="w-20 h-20" />
                </div>
              </div>

              {/* Wallet Address (Always Visible) */}
              <div className="px-0.5">
                <p className="text-slate-400 text-[10.5px] font-bold uppercase tracking-wider mb-1.5">Payment Address ({invoice.network || invoice.coin})</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50/50 border border-slate-200/70 shadow-inner rounded-xl px-4 py-3 text-[13px] font-mono text-slate-700 break-all leading-normal">
                    {invoice.walletAddress}
                  </div>
                  <button onClick={() => copyToClipboard(invoice.walletAddress)} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-850 hover:shadow transition-all duration-200 shrink-0">
                    <Copy size={14} />
                  </button>
                </div>
              </div>

              {/* Network Warning Note */}
              <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                <div className="mt-0.5 text-amber-500 shrink-0">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-[11px] text-amber-800 font-semibold leading-normal">
                  Please send <strong className="font-extrabold">{invoice.coin}</strong> exclusively via the <strong className="font-extrabold">{invoice.network || 'BNB Smart Chain (BEP-20)'}</strong> network. Using any other network will result in permanent loss of funds.
                </p>
              </div>

              {/* Accordion Toggle */}
              <button 
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between px-1 py-1 text-[11px] font-bold text-slate-400 hover:text-slate-750 uppercase tracking-widest transition-colors"
              >
                <span>{showDetails ? 'Hide Invoice Details' : 'View Invoice Details'}</span>
                <svg className={`w-4 h-4 transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Accordion Content */}
              <div className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${showDetails ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                
                {/* Details list card */}
                <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-3">
                  {/* Row 1: Invoice & Order ID */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Invoice ID</p>
                      <p className="text-slate-800 font-semibold text-xs font-mono">#{invoice._id?.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Order ID</p>
                      <p className="text-slate-800 font-semibold text-xs truncate">{invoice.orderId || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Row 2: Customer Name & Email */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Billed To</p>
                      <p className="text-slate-800 font-semibold text-xs truncate">{invoice.customerName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Email</p>
                      <p className="text-slate-800 font-semibold text-xs truncate">{invoice.customerEmail || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Description Box */}
                  {invoice.description && (
                    <div className="border-t border-slate-100 pt-3">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Description</p>
                      <p className="text-slate-700 text-xs leading-relaxed font-medium">
                        {invoice.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Pay Invoice / Status State */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center flex flex-col items-center justify-center gap-2">
            {invoice.status === 'Pending' ? (
              <div className="flex flex-col items-center gap-1.5">
                <RefreshCw size={18} className="animate-spin text-purple-600 mb-1" />
                <p className="text-slate-800 text-[13.5px] font-bold">Waiting for your payment...</p>
                <p className="text-slate-400 text-xs font-semibold">Please send the exact amount to the address above.</p>
              </div>
            ) : invoice.status === 'Partially Paid' ? (
              <div className="flex flex-col items-center gap-1.5">
                <RefreshCw size={18} className="animate-spin text-amber-500 mb-1" />
                <p className="text-amber-700 text-[13.5px] font-bold">Partially Paid</p>
                <p className="text-slate-400 text-xs font-semibold">
                  Please send the remaining {(invoice.usdtAmount - (invoice.receivedAmount || 0)).toFixed(2)} {invoice.coin} to the same address.
                </p>
              </div>
            ) : invoice.status === 'Paid' ? (
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-11 h-11 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-1 text-emerald-600 shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-emerald-700 text-sm font-bold">Payment Successful</p>
                <p className="text-slate-400 text-xs font-medium">Funds have been credited. You may close this tab.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-11 h-11 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-1 text-rose-600 shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <p className="text-rose-700 text-sm font-bold">Invoice Expired</p>
                <p className="text-slate-400 text-xs font-medium">This checkout request is no longer valid.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
