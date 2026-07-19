"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { DollarSign, ChevronDown } from 'lucide-react';

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    coin: 'USDT',
    orderId: '',
    description: '',
    customerName: '',
    customerEmail: ''
  });
  const [merchantLogo, setMerchantLogo] = useState('');
  const [merchantWallet, setMerchantWallet] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [merchantDomain, setMerchantDomain] = useState('');
  const [showCoinDropdown, setShowCoinDropdown] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setMerchantLogo(data.user.logo || '');
          setMerchantWallet(data.user.merchantWallet || '');
          setMerchantName(data.user.businessName || '');
          setMerchantDomain(data.user.website || '');
        }
      })
      .catch(err => console.error('Error fetching settings:', err))
      .finally(() => setPageLoading(false));
  }, []);

  if (pageLoading) {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-8 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Left Side: Form Skeleton */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
            <div className="space-y-2">
              <div className="h-5 bg-slate-100 rounded-lg w-1/3"></div>
              <div className="h-3 bg-slate-100 rounded-lg w-1/2"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl"></div>
              </div>
              <div className="space-y-1.5">
                <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl"></div>
              </div>
              <div className="space-y-1.5">
                <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl"></div>
              </div>
              <div className="space-y-1.5">
                <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                <div className="h-10 bg-slate-50 border border-slate-100 rounded-xl"></div>
              </div>
            </div>
            <div className="pt-2 flex gap-3">
              <div className="h-10 bg-slate-100 rounded-xl w-32"></div>
              <div className="h-10 bg-slate-100 rounded-xl w-24"></div>
            </div>
          </div>

          {/* Right Side: Live Preview Skeleton */}
          <div className="w-full lg:w-[350px] bg-white rounded-2xl border border-slate-100 p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-slate-100 rounded-lg animate-pulse"></div>
                <div className="space-y-1 flex-1">
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                  <div className="h-2.5 bg-slate-100 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-20 bg-slate-50 rounded-xl border border-slate-100 animate-pulse"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-8 bg-slate-50 rounded-lg"></div>
                <div className="h-8 bg-slate-50 rounded-lg"></div>
              </div>
            </div>
            <div className="h-10 bg-slate-100 rounded-xl w-full mt-10"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!merchantLogo) {
      toast.error('Please upload your Business Logo in Settings before creating invoices');
      return;
    }

    if (!formData.amount) {
      toast.error('Amount is required');
      return;
    }
    if (parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }
    if (!formData.orderId.trim()) {
      toast.error('Order ID is required');
      return;
    }
    if (!formData.customerEmail.trim()) {
      toast.error('Customer email is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/invoice/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Invoice created successfully!');
        window.location.href = data.paymentUrl;
      } else {
        toast.error(data.error || 'Failed to create invoice');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Error connecting to API');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-8">
      <div className="flex flex-col lg:flex-row gap-6 items-stretch">
        
        {/* Left Side: Compact Form */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col w-full">
          <div className="relative overflow-hidden px-6 py-6 border-b border-slate-100 flex flex-col gap-1.5 bg-white rounded-t-2xl">
            {/* Background mesh & grid */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-fuchsia-100/60 pointer-events-none z-0"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA0MCAwIEwgMCAwIDAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjA0KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-60 pointer-events-none z-0"></div>
            <div className="absolute -left-10 -top-10 w-48 h-48 bg-indigo-200/30 blur-[60px] rounded-full pointer-events-none z-0"></div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-300/30 blur-[60px] rounded-full pointer-events-none z-0"></div>

            <div className="relative z-10 flex flex-col gap-1">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">Create Invoice</h2>
              <p className="text-slate-500 font-medium text-xs">Generate a manual payment request.</p>
            </div>
          </div>
          <div className="p-6">
            {!merchantLogo && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse"></span>
                <span>You must upload your Business Logo in Settings before you can generate invoices.</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Row 1: Amount & Token */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Amount (USD)</label>
                  <input 
                    type="number" step="0.01" max="9999999" 
                    value={formData.amount} 
                    onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-medium text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Token (BEP20)</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCoinDropdown(!showCoinDropdown)}
                      className="w-full px-4 py-2.5 border border-slate-205 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-semibold text-sm text-slate-700 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <img 
                          src={`/coins/${formData.coin.toLowerCase()}.png`} 
                          alt={formData.coin} 
                          className="w-5 h-5 object-contain shrink-0" 
                        />
                        <span>{formData.coin === 'USDT' ? 'USDT (Tether)' : 'USDC (USD Coin)'}</span>
                      </div>
                      <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${showCoinDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showCoinDropdown && (
                      <>
                        {/* Overlay backdrop to close dropdown on outside clicks */}
                        <div className="fixed inset-0 z-40" onClick={() => setShowCoinDropdown(false)}></div>
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({...formData, coin: 'USDT'});
                              setShowCoinDropdown(false);
                            }}
                            className="w-full px-4 py-3 hover:bg-slate-50 flex items-center gap-2.5 text-left font-semibold text-sm text-slate-700 transition-colors"
                          >
                            <img src="/coins/usdt.png" alt="USDT" className="w-5 h-5 object-contain shrink-0" />
                            <span>USDT (Tether)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({...formData, coin: 'USDC'});
                              setShowCoinDropdown(false);
                            }}
                            className="w-full px-4 py-3 hover:bg-slate-50 flex items-center gap-2.5 text-left font-semibold text-sm text-slate-700 transition-colors"
                          >
                            <img src="/coins/usdc.png" alt="USDC" className="w-5 h-5 object-contain shrink-0" />
                            <span>USDC (USD Coin)</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Order ID & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Order ID</label>
                  <input 
                    type="text" 
                    value={formData.orderId} 
                    onChange={(e) => setFormData({...formData, orderId: e.target.value})} 
                    placeholder="e.g. #ORD-99882"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-medium text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                  <input 
                    type="text" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    placeholder="Services or goods description"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-medium text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50" 
                  />
                </div>
              </div>

              {/* Row 3: Customer Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Customer Name (Optional)</label>
                  <input 
                    type="text" 
                    value={formData.customerName} 
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})} 
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-medium text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Customer Email</label>
                  <input 
                    type="email" 
                    value={formData.customerEmail} 
                    onChange={(e) => setFormData({...formData, customerEmail: e.target.value})} 
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-250 transition-all outline-none font-medium text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/50 hover:bg-slate-50" 
                  />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-md shadow-purple-100 disabled:bg-slate-300 disabled:text-slate-500 text-xs flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> Creating...</>
                  ) : (
                    <>
                      <DollarSign size={14} /> Create Invoice
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  onClick={() => router.push('/dashboard/invoices')} 
                  className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition shadow-sm text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Live Preview (Compact scale) */}
        <div className="w-full lg:w-[350px] shrink-0 flex flex-col">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Live Preview</h3>
          
          <div className="bg-gradient-to-br from-indigo-50/50 via-white to-fuchsia-50/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/80 relative overflow-hidden flex-1 flex flex-col min-h-[380px]">
            <div className="relative z-10 flex-1 flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-start mb-6 border-b border-slate-200/50 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <img src={merchantLogo || "/logo.PNG"} alt="Merchant Logo" className="w-7 h-7 rounded-lg object-contain" />
                    <div>
                      <span className="block font-bold text-slate-800 tracking-tight leading-tight text-xs">{merchantName || 'Merchant Inc.'}</span>
                      {merchantDomain && (
                        <span className="block text-[9px] text-slate-400 font-medium">{merchantDomain}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Billed To</p>
                  <p className="text-slate-800 font-bold text-sm leading-tight">{formData.customerName || 'Customer Name'}</p>
                  <p className="text-slate-500 text-[11px] font-mono leading-none mt-1">{formData.customerEmail || 'customer@email.com'}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-0.5">Invoice</p>
                  <p className="text-slate-700 font-bold text-xs">#INV-0000</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Amount Box */}
                <div className="bg-white/60 rounded-xl p-4 border border-white backdrop-blur-sm shadow-sm flex justify-between items-center">
                  <div>
                    <p className="text-slate-500 text-xs font-semibold mb-1">Amount Due</p>
                    <div className="flex items-center gap-1.5">
                      <img 
                        src={`/coins/${formData.coin?.toLowerCase()}.png`} 
                        alt={formData.coin} 
                        className="w-5 h-5 object-contain shrink-0" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <span className="text-3xl font-normal tracking-tight text-slate-800 leading-none">{formData.amount || '0.00'}</span>
                      <span className="text-slate-655 font-bold text-xs">{formData.coin}</span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 px-0.5">
                  <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Order ID</p>
                    <p className="text-slate-800 font-bold text-xs truncate">{formData.orderId || '#ORD-0000'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Status</p>
                    <span className="inline-block px-2.5 py-1 bg-yellow-100 text-yellow-700 text-[9px] font-bold uppercase tracking-wider rounded-full leading-none">
                      Pending
                    </span>
                  </div>
                </div>

                {/* Description Box */}
                <div className="px-0.5 pt-2">
                  <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Description</p>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    {formData.description || 'No description provided.'}
                  </p>
                </div>
              </div>
              
              {/* Mock Checkout Button */}
              <div className="mt-auto pt-8">
                <button disabled className="w-full py-2.5 bg-slate-950 text-white rounded-xl font-bold text-xs shadow-sm opacity-50 cursor-not-allowed">
                  Pay Invoice
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
