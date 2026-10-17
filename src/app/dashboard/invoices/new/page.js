"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import toast from 'react-hot-toast';
import { DollarSign, ChevronDown, Copy, RefreshCw, Clock } from 'lucide-react';

const ACCENT_COLORS = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#0f172a'];
const PAGE_BG_COLORS = ['#f8fafc', '#ffffff', '#f1f5f9', '#020617', '#090d16'];
const CARD_BG_COLORS = ['#ffffff', '#f8fafc', '#0f172a', '#1e293b', '#111827'];
const TEXT_COLORS = ['#0f172a', '#1e293b', '#ffffff', '#f8fafc', '#64748b'];

export default function NewInvoicePage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showCoinDropdown, setShowCoinDropdown] = useState(false);
  const [previewShowDetails, setPreviewShowDetails] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    coin: 'USDT',
    orderId: '',
    description: '',
    customerName: '',
    customerEmail: ''
  });

  // Custom Design Settings
  const [design, setDesign] = useState({
    layoutStructure: 'classic', // 'classic' | 'split' | 'compact'
    accentColor: '#7c3aed',
    pageBgColor: '#f8fafc',
    cardBgColor: '#ffffff',
    textColor: '#0f172a',
    customerNote: ''
  });

  // Merchant Profile
  const [merchantLogo, setMerchantLogo] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [merchantDomain, setMerchantDomain] = useState('');

  useEffect(() => {
    fetch('/api/user/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setMerchantLogo(data.user.logo || '');
          setMerchantName(data.user.businessName || '');
          setMerchantDomain(data.user.website || '');
          if (data.user.invoiceDesign && Object.keys(data.user.invoiceDesign).length > 0) {
            setDesign(prev => ({
              ...prev,
              layoutStructure: data.user.invoiceDesign.layoutStructure || 'classic',
              accentColor: data.user.invoiceDesign.accentColor || '#7c3aed',
              pageBgColor: data.user.invoiceDesign.pageBgColor || '#f8fafc',
              cardBgColor: data.user.invoiceDesign.cardBgColor || '#ffffff',
              textColor: data.user.invoiceDesign.textColor || '#0f172a',
              customerNote: data.user.invoiceDesign.customerNote || ''
            }));
          }
        }
      })
      .catch(err => console.error('Error fetching settings:', err))
      .finally(() => setPageLoading(false));
  }, []);

  const handleSaveTemplate = async () => {
    setSavingTemplate(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceDesign: design })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(language === 'es' ? 'Plantilla guardada exitosamente' : 'Template saved successfully');
      } else {
        toast.error(data.error || (language === 'es' ? 'Error al guardar la plantilla' : 'Failed to save template'));
      }
    } catch (err) {
      console.error(err);
      toast.error(language === 'es' ? 'Error de conexión' : 'Connection error');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!merchantLogo) {
      toast.error(
        language === 'es' 
          ? 'Por favor suba el logotipo de su empresa en Configuración antes de crear facturas.' 
          : 'Please upload your Business Logo in Settings before creating invoices'
      );
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error(language === 'es' ? 'Ingrese un monto válido mayor a cero' : 'Please enter a valid amount greater than zero');
      return;
    }

    if (!formData.orderId.trim()) {
      toast.error(language === 'es' ? 'El ID de orden es requerido' : 'Order ID is required');
      return;
    }

    if (!formData.customerEmail.trim()) {
      toast.error(language === 'es' ? 'El correo del cliente es requerido' : 'Customer email is required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/invoice/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          design
        })
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success(language === 'es' ? 'Factura creada exitosamente' : 'Invoice created successfully');
        window.location.href = data.paymentUrl;
      } else {
        toast.error(data.error || (language === 'es' ? 'Error al crear la factura' : 'Failed to create invoice'));
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error(language === 'es' ? 'Error de conexión' : 'Connection error');
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-6 space-y-6">
            <div className="h-5 bg-slate-100 rounded w-1/4"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-slate-50 rounded-xl"></div>
              <div className="h-10 bg-slate-50 rounded-xl"></div>
            </div>
          </div>
          <div className="w-full lg:w-[420px] h-[520px] bg-white rounded-2xl border border-slate-100"></div>
        </div>
      </div>
    );
  }

  const structure = design.layoutStructure || 'classic';
  const displayAmount = formData.amount ? Number(formData.amount).toFixed(2) : '200.00';
  const displayCoin = formData.coin || 'USDT';
  const displayOrderId = formData.orderId || 'DEP-154524';
  const displayCustomer = formData.customerName || 'Mauricio Guerreros';
  const displayEmail = formData.customerEmail || 'mauricioguerreros37@gmail.com';
  const displayDescription = formData.description || 'Deposit DEP-154524 to wallet';
  const sampleAddress = '0x5a5a9f11524dAA9E4Ac0B50d4a5595cd91CeBFCc';

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8">
      
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {language === 'es' ? 'Crear Factura' : 'Create Invoice'}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {language === 'es' 
            ? 'Complete los datos del pago y personalice la estructura y colores de la factura.' 
            : 'Fill in payment details and customize the invoice structure and colors.'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Side: Form */}
        <div className="flex-1 w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
          
          {!merchantLogo && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-medium">
              {language === 'es' 
                ? 'Debe subir el logotipo de su empresa en Configuración antes de generar facturas.' 
                : 'Please upload your Business Logo in Settings before generating invoices.'}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Payment Details */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {language === 'es' ? 'Detalles del Pago' : 'Payment Details'}
              </h2>

              {/* Row 1: Amount & Token */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                    {language === 'es' ? 'Monto (USD)' : 'Amount (USD)'}
                  </label>
                  <input 
                    type="number" 
                    step="0.01" 
                    max="9999999" 
                    value={formData.amount} 
                    onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300 outline-none transition" 
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                    Token (BEP20)
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCoinDropdown(!showCoinDropdown)}
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between outline-none"
                    >
                      <div className="flex items-center gap-2">
                        <img 
                          src={`/coins/${formData.coin.toLowerCase()}.png`} 
                          alt={formData.coin} 
                          className="w-5 h-5 object-contain shrink-0" 
                        />
                        <span>{formData.coin === 'USDT' ? 'USDT (Tether)' : 'USDC (USD Coin)'}</span>
                      </div>
                      <ChevronDown size={14} className={`text-slate-400 transition-transform ${showCoinDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showCoinDropdown && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowCoinDropdown(false)}></div>
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({...formData, coin: 'USDT'});
                              setShowCoinDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-left text-sm font-semibold text-slate-700"
                          >
                            <img src="/coins/usdt.png" alt="USDT" className="w-5 h-5 object-contain" />
                            <span>USDT (Tether)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({...formData, coin: 'USDC'});
                              setShowCoinDropdown(false);
                            }}
                            className="w-full px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-left text-sm font-semibold text-slate-700"
                          >
                            <img src="/coins/usdc.png" alt="USDC" className="w-5 h-5 object-contain" />
                            <span>USDC (USD Coin)</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Order ID & Customer Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                    Order ID
                  </label>
                  <input 
                    type="text" 
                    value={formData.orderId} 
                    onChange={(e) => setFormData({...formData, orderId: e.target.value})} 
                    placeholder="e.g. #ORD-1002"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300 outline-none transition" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                    {language === 'es' ? 'Correo del Cliente' : 'Customer Email'}
                  </label>
                  <input 
                    type="email" 
                    value={formData.customerEmail} 
                    onChange={(e) => setFormData({...formData, customerEmail: e.target.value})} 
                    placeholder="customer@example.com"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300 outline-none transition" 
                  />
                </div>
              </div>

              {/* Row 3: Customer Name & Description (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                    {language === 'es' ? 'Nombre del Cliente (Opcional)' : 'Customer Name (Optional)'}
                  </label>
                  <input 
                    type="text" 
                    value={formData.customerName} 
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})} 
                    placeholder="John Doe"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300 outline-none transition" 
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                    {language === 'es' ? 'Descripción (Opcional)' : 'Description (Optional)'}
                  </label>
                  <input 
                    type="text" 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    placeholder={language === 'es' ? 'Servicios o productos' : 'Services or goods description'}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300 outline-none transition" 
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Invoice Page Custom Design */}
            <div className="pt-5 border-t border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {language === 'es' ? 'Diseño y Estructura' : 'Invoice Design & Structure'}
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'es' 
                      ? 'Elija la estructura de diseño, colores y nota de la factura.' 
                      : 'Choose the layout structure, colors, and customer note.'}
                  </p>
                </div>

                {/* Save Template Button */}
                <button
                  type="button"
                  onClick={handleSaveTemplate}
                  disabled={savingTemplate}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 transition disabled:opacity-50 shrink-0"
                >
                  {savingTemplate ? (language === 'es' ? 'Guardando...' : 'Saving...') : (language === 'es' ? 'Guardar Plantilla' : 'Save Template')}
                </button>
              </div>

              {/* Structure Selector */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-semibold text-slate-600">
                    {language === 'es' ? 'Estructura de la Factura' : 'Invoice Structure'}
                  </label>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                    {structure}
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  {[
                    { id: 'classic', label: language === 'es' ? 'Clásica' : 'Classic', hint: 'Original' },
                    { id: 'split', label: language === 'es' ? 'Dividida' : 'Split', hint: '2 Columns' },
                    { id: 'compact', label: language === 'es' ? 'Compacta' : 'Compact', hint: 'Centered' },
                    { id: 'minimal', label: language === 'es' ? 'Minimal' : 'Minimal', hint: 'Clean' },
                    { id: 'banner', label: language === 'es' ? 'Banner' : 'Banner', hint: 'Hero' },
                    { id: 'receipt', label: language === 'es' ? 'Recibo' : 'Receipt', hint: 'Ticket' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDesign({...design, layoutStructure: item.id})}
                      className={`py-2 px-1 rounded-lg text-xs font-semibold transition flex flex-col items-center justify-center text-center ${
                        structure === item.id
                          ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                      }`}
                    >
                      <span className="truncate w-full">{item.label}</span>
                      <span className="text-[9px] opacity-50 font-normal leading-tight">{item.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Colors Grid: Accent, Text Color, Page Background, Card Background */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                
                {/* 1. Brand Accent Color */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                    {language === 'es' ? 'Color de Acento' : 'Accent Color'}
                  </label>
                  <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-1 flex-1">
                      {ACCENT_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setDesign({...design, accentColor: color})}
                          className={`w-5 h-5 rounded-md transition-transform ${
                            design.accentColor.toLowerCase() === color.toLowerCase() 
                              ? 'scale-110 ring-2 ring-slate-400 ring-offset-1' 
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input 
                      type="color" 
                      value={design.accentColor} 
                      onChange={(e) => setDesign({...design, accentColor: e.target.value})}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase mt-1 block">
                    {design.accentColor}
                  </span>
                </div>

                {/* 2. Text Color */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                    {language === 'es' ? 'Color del Texto' : 'Text Color'}
                  </label>
                  <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-1 flex-1">
                      {TEXT_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setDesign({...design, textColor: color})}
                          className={`w-5 h-5 rounded-md border border-slate-300 transition-transform ${
                            design.textColor.toLowerCase() === color.toLowerCase() 
                              ? 'scale-110 ring-2 ring-slate-400 ring-offset-1' 
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input 
                      type="color" 
                      value={design.textColor} 
                      onChange={(e) => setDesign({...design, textColor: e.target.value})}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase mt-1 block">
                    {design.textColor}
                  </span>
                </div>

                {/* 3. Page Background Color */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                    {language === 'es' ? 'Fondo de la Página' : 'Page Background'}
                  </label>
                  <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-1 flex-1">
                      {PAGE_BG_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setDesign({...design, pageBgColor: color})}
                          className={`w-5 h-5 rounded-md border border-slate-300 transition-transform ${
                            design.pageBgColor.toLowerCase() === color.toLowerCase() 
                              ? 'scale-110 ring-2 ring-slate-400 ring-offset-1' 
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input 
                      type="color" 
                      value={design.pageBgColor} 
                      onChange={(e) => setDesign({...design, pageBgColor: e.target.value})}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase mt-1 block">
                    {design.pageBgColor}
                  </span>
                </div>

                {/* 4. Invoice Card Background Color */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                    {language === 'es' ? 'Fondo de la Factura' : 'Invoice Card Background'}
                  </label>
                  <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-1 flex-1">
                      {CARD_BG_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setDesign({...design, cardBgColor: color})}
                          className={`w-5 h-5 rounded-md border border-slate-300 transition-transform ${
                            design.cardBgColor.toLowerCase() === color.toLowerCase() 
                              ? 'scale-110 ring-2 ring-slate-400 ring-offset-1' 
                              : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <input 
                      type="color" 
                      value={design.cardBgColor} 
                      onChange={(e) => setDesign({...design, cardBgColor: e.target.value})}
                      className="w-5 h-5 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase mt-1 block">
                    {design.cardBgColor}
                  </span>
                </div>

              </div>

              {/* Note to Customer */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  {language === 'es' ? 'Nota para el Cliente (Opcional)' : 'Note to Customer (Optional)'}
                </label>
                <input 
                  type="text" 
                  value={design.customerNote} 
                  onChange={(e) => setDesign({...design, customerNote: e.target.value})} 
                  placeholder={language === 'es' ? 'ej. Gracias por su compra. El pedido se procesará automáticamente.' : 'e.g. Thank you for your business. Orders are processed immediately.'}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-purple-100 focus:border-purple-300 outline-none transition" 
                />
              </div>

            </div>

            {/* Submit & Cancel */}
            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button 
                type="submit" 
                disabled={loading} 
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition disabled:bg-slate-300 disabled:text-slate-500 text-xs flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> {language === 'es' ? 'Creando...' : 'Creating...'}</>
                ) : (
                  <>
                    <DollarSign size={14} /> {language === 'es' ? 'Crear Factura' : 'Create Invoice'}
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => router.push('/dashboard/invoices')} 
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition text-xs"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
            </div>

          </form>
        </div>

        {/* Right Side: Exact Live Preview Matching /invoice/6a6e190c0fd59a0f5bbeeeb3 */}
        <div className="w-full lg:w-[440px] shrink-0 sticky top-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
            {language === 'es' ? 'Vista Previa en Vivo' : 'Live Preview'}
          </p>
          
          {/* Simulated Outer Page with Ambient Glow and Texture */}
          <div 
            className="p-4 sm:p-5 rounded-[2.5rem] border border-slate-200/80 transition-colors shadow-sm relative overflow-hidden"
            style={{ 
              backgroundColor: design.pageBgColor,
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(148, 163, 184, 0.22) 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          >
            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div 
                className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[70px] opacity-40" 
                style={{ backgroundColor: design.accentColor || '#7c3aed' }}
              />
              <div className="absolute -bottom-[10%] -right-[5%] w-[60%] h-[60%] rounded-full bg-fuchsia-200/40 blur-[70px]" />
            </div>

            {/* Simulated Authentic Invoice Card */}
            <div 
              className="rounded-[2.25rem] p-5 sm:p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] border border-slate-200/70 relative z-10 transition-colors overflow-hidden"
              style={{ 
                backgroundColor: design.cardBgColor,
                color: design.textColor
              }}
            >
              
              {/* STRUCTURE: COMPACT */}
              {structure === 'compact' && (
                <div className="space-y-3 text-center">
                  {/* Centered Logo & Brand */}
                  <div className="flex flex-col items-center gap-1.5 pb-2.5 border-b border-current/10">
                    <img 
                      src={merchantLogo || "/logo.PNG"} 
                      alt="Merchant Logo" 
                      className="w-11 h-11 rounded-2xl object-contain p-1 border border-slate-200/60 bg-slate-50 shadow-xs" 
                    />
                    <div>
                      <span className="font-bold text-xs block leading-tight">{merchantName || 'Vexta'}</span>
                      {merchantDomain && (
                        <span className="text-[10px] opacity-60 font-medium block mt-0.5">{merchantDomain}</span>
                      )}
                    </div>
                    {/* Status & Timer Row */}
                    <div className="flex items-center justify-center gap-1.5 mt-0.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60 shadow-xs">
                        {t('dashStatusPending')}
                      </span>
                      <div className="flex items-center gap-1 text-[9.5px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100/80 shadow-xs">
                        <Clock size={10} strokeWidth={2.5} />
                        <span>14:59</span>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Progress Bar */}
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden shrink-0 my-0.5">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: '85%',
                        background: design.accentColor 
                          ? `linear-gradient(to right, ${design.accentColor}, #f59e0b)`
                          : 'linear-gradient(to right, #f43f5e, #f59e0b)'
                      }}
                    />
                  </div>

                  {/* Centered Amount */}
                  <div className="py-1">
                    <p className="text-[9.5px] font-bold uppercase tracking-wider mb-1 opacity-70">
                      {language === 'es' ? 'Monto Vencido' : 'Amount Due'}
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                      <img 
                        src={`/coins/${formData.coin.toLowerCase()}.png`} 
                        alt={formData.coin} 
                        className="w-5 h-5 object-contain" 
                      />
                      <span 
                        className="text-3xl font-extrabold tracking-tight leading-none"
                        style={{ color: design.accentColor }}
                      >
                        {displayAmount}
                      </span>
                      <span className="text-xs font-bold opacity-70">{displayCoin}</span>
                    </div>
                  </div>

                  {/* Centered QR */}
                  <div className="flex justify-center">
                    <div className="bg-white p-1.5 rounded-2xl shadow-xs border border-slate-200/60 inline-block">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${sampleAddress}`} 
                        alt="QR" 
                        className="w-20 h-20" 
                      />
                    </div>
                  </div>

                  {/* Compact Address */}
                  <div className="text-left px-0.5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9.5px] opacity-70 font-bold uppercase tracking-wider">{t('mockPaymentAddress')}</span>
                      <span className="text-[9.5px] font-bold flex items-center gap-1" style={{ color: design.accentColor }}>
                        <Copy size={10} />
                        <span>{language === 'es' ? 'Copiar' : 'Copy'}</span>
                      </span>
                    </div>
                    <div className="border border-current/10 bg-current/5 p-2 rounded-xl font-mono text-[10px] break-all select-all">
                      {sampleAddress}
                    </div>
                  </div>

                  {/* Network Warning */}
                  <div className="flex items-start gap-2 bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5 text-left">
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="text-[10px] text-amber-800 font-semibold leading-normal">
                      {language === 'es' 
                        ? `Envíe ${displayCoin} exclusivamente por red BNB Smart Chain (BEP-20).`
                        : `Please send ${displayCoin} exclusively via the BNB Smart Chain (BEP-20) network.`}
                    </p>
                  </div>

                  {/* Minimal rows */}
                  <div className="pt-2 border-t border-current/10 space-y-1 text-left text-[10.5px]">
                    <div className="flex justify-between">
                      <span className="opacity-70">Order ID:</span>
                      <span className="font-mono font-medium">{displayOrderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-70">{language === 'es' ? 'Cliente:' : 'Customer:'}</span>
                      <span className="font-medium truncate">{displayCustomer}</span>
                    </div>
                  </div>

                  {/* Note */}
                  {design.customerNote && (
                    <div className="p-2.5 rounded-xl border border-current/10 bg-current/5 text-[10.5px] text-left leading-relaxed">
                      {design.customerNote}
                    </div>
                  )}

                  {/* Authentic Status State */}
                  <div className="pt-3 border-t border-current/10 flex flex-col items-center gap-1">
                    <RefreshCw size={14} className="animate-spin text-purple-600 mb-0.5" style={{ color: design.accentColor }} />
                    <p className="text-xs font-bold">{language === 'es' ? 'Esperando por su pago...' : 'Waiting for your payment...'}</p>
                    <p className="text-[9.5px] opacity-60 font-medium">{language === 'es' ? 'Por favor envíe la cantidad exacta.' : 'Please send the exact amount.'}</p>
                  </div>
                </div>
              )}

              {/* STRUCTURE: SPLIT (Two-column layout) */}
              {structure === 'split' && (
                <div className="space-y-3.5">
                  {/* Top Bar with Brand + Status & Timer */}
                  <div className="flex justify-between items-center pb-2.5 border-b border-current/10">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={merchantLogo || "/logo.PNG"} 
                        alt="Merchant Logo" 
                        className="w-9 h-9 rounded-xl object-contain p-1 border border-slate-200/60 bg-slate-50 shadow-xs" 
                      />
                      <div>
                        <span className="font-bold text-xs block leading-tight">{merchantName || 'Vexta'}</span>
                        {merchantDomain && (
                          <span className="text-[10px] opacity-60 font-medium block">{merchantDomain}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end shrink-0">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60 shadow-xs">
                        {t('dashStatusPending')}
                      </span>
                      <div className="mt-1 flex items-center gap-1 text-[9.5px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100/80 shadow-xs">
                        <Clock size={10} strokeWidth={2.5} />
                        <span>14:59</span>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Progress Bar */}
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden shrink-0 my-0.5">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: '85%',
                        background: design.accentColor 
                          ? `linear-gradient(to right, ${design.accentColor}, #f59e0b)`
                          : 'linear-gradient(to right, #f43f5e, #f59e0b)'
                      }}
                    />
                  </div>

                  {/* Split Grid */}
                  <div className="grid grid-cols-2 gap-3 items-center bg-current/5 p-3 rounded-2xl border border-current/10">
                    {/* Left: Amount & Order */}
                    <div className="space-y-1.5">
                      <p className="text-[9.5px] uppercase tracking-wider opacity-70 font-bold">
                        {language === 'es' ? 'Monto Vencido' : 'Amount Due'}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <img 
                          src={`/coins/${formData.coin.toLowerCase()}.png`} 
                          alt={formData.coin} 
                          className="w-4 h-4 object-contain inline-block" 
                        />
                        <span 
                          className="text-xl font-extrabold tracking-tight leading-none"
                          style={{ color: design.accentColor }}
                        >
                          {displayAmount}
                        </span>
                        <span className="text-[10px] font-bold opacity-70">{displayCoin}</span>
                      </div>
                      <div className="text-[10px] space-y-0.5 pt-1.5 border-t border-current/10">
                        <p className="opacity-70 font-mono">#{displayOrderId}</p>
                        <p className="opacity-70 truncate">{displayCustomer}</p>
                      </div>
                    </div>

                    {/* Right: QR Code */}
                    <div className="flex flex-col items-center">
                      <div className="bg-white p-1 rounded-xl border border-slate-200/60 inline-block mb-1 shadow-xs">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${sampleAddress}`} 
                          alt="QR" 
                          className="w-16 h-16" 
                        />
                      </div>
                      <span className="text-[9px] font-mono opacity-70">BEP-20 Network</span>
                    </div>
                  </div>

                  {/* Address bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1 px-0.5">
                      <span className="text-[9.5px] opacity-70 font-bold uppercase tracking-wider">{t('mockPaymentAddress')}</span>
                      <span className="text-[9.5px] font-bold flex items-center gap-1" style={{ color: design.accentColor }}>
                        <Copy size={10} />
                        <span>{language === 'es' ? 'Copiar Dirección' : 'Copy Address'}</span>
                      </span>
                    </div>
                    <div className="border border-current/10 bg-current/5 p-2 rounded-xl font-mono text-[10px] break-all select-all">
                      {sampleAddress}
                    </div>
                  </div>

                  {/* Network Warning */}
                  <div className="flex items-start gap-2 bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="text-[10px] text-amber-800 font-semibold leading-normal">
                      {language === 'es' 
                        ? `Envíe ${displayCoin} exclusivamente por red BNB Smart Chain (BEP-20).`
                        : `Please send ${displayCoin} exclusively via the BNB Smart Chain (BEP-20) network.`}
                    </p>
                  </div>

                  {/* Note */}
                  {design.customerNote && (
                    <div className="p-2.5 rounded-xl border border-current/10 bg-current/5 text-[10.5px] leading-relaxed">
                      {design.customerNote}
                    </div>
                  )}

                  {/* Authentic Status State */}
                  <div className="pt-3 border-t border-current/10 flex flex-col items-center gap-1">
                    <RefreshCw size={14} className="animate-spin text-purple-600 mb-0.5" style={{ color: design.accentColor }} />
                    <p className="text-xs font-bold">{language === 'es' ? 'Esperando por su pago...' : 'Waiting for your payment...'}</p>
                    <p className="text-[9.5px] opacity-60 font-medium">{language === 'es' ? 'Por favor envíe la cantidad exacta a la dirección de arriba.' : 'Please send the exact amount to the address above.'}</p>
                  </div>
                </div>
              )}

              {/* STRUCTURE: MINIMAL (Modern Clean Aesthetic) */}
              {structure === 'minimal' && (
                <div className="space-y-3.5">
                  {/* Minimal Header */}
                  <div className="flex justify-between items-center pb-2 border-b border-current/10">
                    <div className="flex items-center gap-2">
                      <img 
                        src={merchantLogo || "/logo.PNG"} 
                        alt="Merchant Logo" 
                        className="w-7 h-7 rounded-lg object-contain p-0.5 border border-slate-200/60 bg-slate-50" 
                      />
                      <span className="font-bold text-xs">{merchantName || 'Vexta'}</span>
                    </div>
                    {/* Minimalist Live Timer Pill */}
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      <span className="text-[9.5px] font-bold uppercase tracking-wider opacity-70">{t('dashStatusPending')}</span>
                      <span className="opacity-20">|</span>
                      <div className="flex items-center gap-1 text-[9.5px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                        <Clock size={10} strokeWidth={2.5} />
                        <span>14:59</span>
                      </div>
                    </div>
                  </div>

                  {/* Hairline Progress */}
                  <div className="w-full h-0.5 bg-slate-100 rounded-full overflow-hidden shrink-0">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: '85%',
                        background: design.accentColor 
                          ? `linear-gradient(to right, ${design.accentColor}, #f59e0b)`
                          : 'linear-gradient(to right, #f43f5e, #f59e0b)'
                      }}
                    />
                  </div>

                  {/* Large Minimal Amount Section */}
                  <div className="text-center pt-1 pb-1">
                    <p className="text-[9.5px] font-bold uppercase tracking-widest opacity-60 mb-1">
                      {language === 'es' ? 'Total a Pagar' : 'Total Payment'}
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                      <img 
                        src={`/coins/${formData.coin.toLowerCase()}.png`} 
                        alt={formData.coin} 
                        className="w-6 h-6 object-contain" 
                      />
                      <span 
                        className="text-3xl font-extrabold tracking-tight leading-none"
                        style={{ color: design.accentColor }}
                      >
                        {displayAmount}
                      </span>
                      <span className="text-xs font-bold opacity-70">{displayCoin}</span>
                    </div>
                    <p className="text-[10px] font-mono opacity-50 mt-1">Ref: #{displayOrderId}</p>
                  </div>

                  {/* Clean Centered QR */}
                  <div className="flex justify-center">
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200/80 inline-block">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${sampleAddress}`} 
                        alt="QR" 
                        className="w-24 h-24" 
                      />
                    </div>
                  </div>

                  {/* Sleek 1-Click Copy Pill */}
                  <div className="border border-current/10 bg-current/5 p-2 rounded-xl flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] truncate select-all">{sampleAddress}</span>
                    <button 
                      type="button"
                      className="text-[9.5px] font-bold flex items-center gap-1 px-2 py-1 rounded-lg shrink-0 text-white shadow-xs"
                      style={{ backgroundColor: design.accentColor }}
                    >
                      <Copy size={10} />
                      <span>{language === 'es' ? 'Copiar' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Subtle Alert */}
                  <div className="text-[10px] text-amber-800 bg-amber-50/70 border border-amber-200/60 rounded-xl p-2 text-center font-medium">
                    {language === 'es' ? `Red BEP-20 exclusivamente` : `Send only via BNB Smart Chain (BEP-20)`}
                  </div>

                  {/* Note */}
                  {design.customerNote && (
                    <div className="p-2 rounded-xl border border-current/10 bg-current/5 text-[10px] text-center italic">
                      &quot;{design.customerNote}&quot;
                    </div>
                  )}

                  {/* Status */}
                  <div className="pt-2 border-t border-current/10 flex items-center justify-center gap-1.5 text-xs font-semibold">
                    <RefreshCw size={12} className="animate-spin text-purple-600" style={{ color: design.accentColor }} />
                    <span>{language === 'es' ? 'Esperando pago en vivo...' : 'Listening for live payment...'}</span>
                  </div>
                </div>
              )}

              {/* STRUCTURE: BANNER (Hero Header with Accent Color) */}
              {structure === 'banner' && (
                <div className="space-y-3.5">
                  {/* Hero Accent Banner */}
                  <div 
                    className="-mx-5 -mt-5 sm:-mx-6 sm:-mt-6 p-4 sm:p-5 text-white mb-3 shadow-inner relative transition-colors"
                    style={{ backgroundColor: design.accentColor || '#7c3aed' }}
                  >
                    <div className="flex justify-between items-start mb-2.5">
                      <div className="flex items-center gap-2">
                        <img 
                          src={merchantLogo || "/logo.PNG"} 
                          alt="Merchant Logo" 
                          className="w-8 h-8 rounded-xl object-contain p-0.5 bg-white/10 border border-white/20 backdrop-blur" 
                        />
                        <div>
                          <span className="font-bold text-xs block leading-tight text-white">{merchantName || 'Vexta'}</span>
                          {merchantDomain && (
                            <span className="text-[9px] text-white/70 block">{merchantDomain}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end shrink-0">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur border border-white/30">
                          {t('dashStatusPending')}
                        </span>
                        <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-white bg-white/20 backdrop-blur px-2 py-0.5 rounded-full border border-white/30">
                          <Clock size={10} strokeWidth={2.5} />
                          <span>14:59</span>
                        </div>
                      </div>
                    </div>

                    {/* Hero Amount */}
                    <div className="text-center py-1.5 border-t border-white/15">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-white/75 mb-0.5">
                        {language === 'es' ? 'Monto Vencido' : 'Amount Due'}
                      </p>
                      <div className="flex items-center justify-center gap-1.5">
                        <img 
                          src={`/coins/${formData.coin.toLowerCase()}.png`} 
                          alt={formData.coin} 
                          className="w-5 h-5 object-contain" 
                        />
                        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
                          {displayAmount}
                        </span>
                        <span className="text-xs font-bold text-white/80">{displayCoin}</span>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Progress Bar */}
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden shrink-0 my-0.5">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: '85%',
                        background: design.accentColor 
                          ? `linear-gradient(to right, ${design.accentColor}, #f59e0b)`
                          : 'linear-gradient(to right, #f43f5e, #f59e0b)'
                      }}
                    />
                  </div>

                  {/* Centered QR */}
                  <div className="flex justify-center">
                    <div className="bg-white p-1.5 rounded-2xl shadow-xs border border-slate-200/60 inline-block">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${sampleAddress}`} 
                        alt="QR" 
                        className="w-18 h-18" 
                      />
                    </div>
                  </div>

                  {/* Address bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1 px-0.5">
                      <span className="text-[9.5px] opacity-70 font-bold uppercase tracking-wider">{t('mockPaymentAddress')}</span>
                      <span className="text-[9.5px] font-bold flex items-center gap-1" style={{ color: design.accentColor }}>
                        <Copy size={10} />
                        <span>{language === 'es' ? 'Copiar Dirección' : 'Copy Address'}</span>
                      </span>
                    </div>
                    <div className="border border-current/10 bg-current/5 p-2 rounded-xl font-mono text-[10px] break-all select-all">
                      {sampleAddress}
                    </div>
                  </div>

                  {/* Network Warning */}
                  <div className="flex items-start gap-2 bg-amber-50/60 border border-amber-200/60 rounded-xl p-2.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="text-[10px] text-amber-800 font-semibold leading-normal">
                      {language === 'es' 
                        ? `Envíe ${displayCoin} exclusivamente por red BNB Smart Chain (BEP-20).`
                        : `Please send ${displayCoin} exclusively via the BNB Smart Chain (BEP-20) network.`}
                    </p>
                  </div>

                  {/* Note */}
                  {design.customerNote && (
                    <div className="p-2.5 rounded-xl border border-current/10 bg-current/5 text-[10.5px] leading-relaxed">
                      {design.customerNote}
                    </div>
                  )}

                  {/* Status State */}
                  <div className="pt-2 border-t border-current/10 flex flex-col items-center gap-0.5 text-center">
                    <RefreshCw size={13} className="animate-spin text-purple-600 mb-0.5" style={{ color: design.accentColor }} />
                    <p className="text-xs font-bold">{language === 'es' ? 'Esperando confirmación...' : 'Waiting for confirmation...'}</p>
                  </div>
                </div>
              )}

              {/* STRUCTURE: RECEIPT (Digital Voucher Ticket with Notched Perforations) */}
              {structure === 'receipt' && (
                <div className="space-y-3">
                  {/* Top Voucher Header */}
                  <div className="flex justify-between items-start pb-2 border-b border-current/10">
                    <div className="flex items-center gap-2">
                      <img 
                        src={merchantLogo || "/logo.PNG"} 
                        alt="Merchant Logo" 
                        className="w-8 h-8 rounded-xl object-contain p-0.5 border border-slate-200/60 bg-slate-50" 
                      />
                      <div>
                        <span className="font-bold text-xs block leading-tight">{merchantName || 'Vexta'}</span>
                        <span className="text-[8.5px] uppercase font-bold tracking-wider opacity-50 block">CHECKOUT RECEIPT</span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end shrink-0">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/60">
                        {t('dashStatusPending')}
                      </span>
                      <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100/80">
                        <Clock size={10} strokeWidth={2.5} />
                        <span>14:59</span>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Progress Bar */}
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden shrink-0">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: '85%',
                        background: design.accentColor 
                          ? `linear-gradient(to right, ${design.accentColor}, #f59e0b)`
                          : 'linear-gradient(to right, #f43f5e, #f59e0b)'
                      }}
                    />
                  </div>

                  {/* Receipt Itemized Table */}
                  <div className="bg-current/5 border border-current/10 rounded-xl p-2.5 space-y-1.5 text-[10.5px]">
                    <div className="flex justify-between items-center font-bold">
                      <span className="opacity-70">{language === 'es' ? 'Total Factura:' : 'Invoice Total:'}</span>
                      <span className="text-sm font-extrabold" style={{ color: design.accentColor }}>{displayAmount} {displayCoin}</span>
                    </div>
                    <div className="flex justify-between items-center opacity-75 pt-1 border-t border-current/10">
                      <span>Order Reference:</span>
                      <span className="font-mono">{displayOrderId}</span>
                    </div>
                    <div className="flex justify-between items-center opacity-75">
                      <span>{language === 'es' ? 'Cliente:' : 'Customer:'}</span>
                      <span className="truncate">{displayCustomer}</span>
                    </div>
                    <div className="flex justify-between items-center opacity-75">
                      <span>Network:</span>
                      <span className="font-medium">BEP-20 (BNB Chain)</span>
                    </div>
                  </div>

                  {/* Perforated Divider */}
                  <div className="relative my-2 py-1 flex items-center">
                    <div className="w-full border-t-2 border-dashed border-current/20"></div>
                  </div>

                  {/* Settlement Bottom Section */}
                  <div className="flex items-center justify-between gap-3 bg-current/5 p-2.5 rounded-xl border border-current/10">
                    <div className="space-y-1 flex-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider opacity-60 block">Scan to Pay</span>
                      <div className="border border-current/10 bg-current/5 p-1.5 rounded-lg font-mono text-[9.5px] break-all select-all">
                        {sampleAddress}
                      </div>
                      <span className="text-[9.5px] font-bold flex items-center gap-1 cursor-pointer" style={{ color: design.accentColor }}>
                        <Copy size={10} />
                        <span>{language === 'es' ? 'Copiar Dirección' : 'Copy Address'}</span>
                      </span>
                    </div>
                    <div className="bg-white p-1 rounded-xl shadow-xs border border-slate-200/60 shrink-0">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${sampleAddress}`} 
                        alt="QR" 
                        className="w-14 h-14" 
                      />
                    </div>
                  </div>

                  {/* Warning Note */}
                  <div className="text-[9.5px] text-amber-800 bg-amber-50/70 border border-amber-200/60 rounded-xl p-2 font-medium text-center">
                    {language === 'es' ? `Envíe exactamente ${displayAmount} ${displayCoin}` : `Please send exact amount: ${displayAmount} ${displayCoin}`}
                  </div>

                  {/* Note */}
                  {design.customerNote && (
                    <div className="p-2 rounded-xl border border-current/10 bg-current/5 text-[10px] text-left">
                      {design.customerNote}
                    </div>
                  )}

                  {/* Status Indicator */}
                  <div className="pt-2 border-t border-current/10 flex items-center justify-center gap-1 text-[11px] font-bold">
                    <RefreshCw size={12} className="animate-spin text-purple-600" style={{ color: design.accentColor }} />
                    <span>{language === 'es' ? 'Esperando pago del ticket...' : 'Waiting for payment...'}</span>
                  </div>
                </div>
              )}

              {/* STRUCTURE: CLASSIC (Exact replica of /invoice/6a6e190c0fd59a0f5bbeeeb3) */}
              {structure === 'classic' && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-0.5 pb-0.5">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <img 
                          src={merchantLogo || "/logo.PNG"} 
                          alt="Merchant Logo" 
                          className="w-11 h-11 rounded-2xl object-contain bg-slate-50 border border-slate-200/60 p-1.5 shadow-sm" 
                        />
                        <div>
                          <span className="block font-bold tracking-tight text-xs leading-tight">
                            {merchantName || 'Vexta'}
                          </span>
                          {merchantDomain && (
                            <span className="block text-[10px] opacity-60 font-semibold mt-0.5">
                              {merchantDomain}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end shrink-0">
                      <span className="inline-block px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider rounded-full shadow-xs border bg-amber-50 text-amber-700 border-amber-200/40">
                        {t('dashStatusPending')}
                      </span>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100/80 shadow-xs">
                        <Clock size={10} strokeWidth={2.5} />
                        <span>14:59</span>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Progress Bar */}
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden shrink-0 my-1">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: '85%',
                        background: design.accentColor 
                          ? `linear-gradient(to right, ${design.accentColor}, #f59e0b)`
                          : 'linear-gradient(to right, #f43f5e, #f59e0b)'
                      }}
                    ></div>
                  </div>

                  {/* Amount & QR Box */}
                  <div className="flex justify-between items-center gap-3 bg-current/5 border border-current/10 p-3.5 rounded-[1.25rem]">
                    <div>
                      <p className="text-[9.5px] font-bold uppercase tracking-wider mb-1 opacity-70">
                        {language === 'es' ? 'Monto Vencido' : 'Amount Due'}
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <img 
                          src={`/coins/${formData.coin.toLowerCase()}.png`} 
                          alt={formData.coin} 
                          className="w-5 h-5 object-contain shrink-0" 
                        />
                        <span 
                          className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-none"
                          style={{ color: design.accentColor }}
                        >
                          {displayAmount}
                        </span>
                        <span className="opacity-70 font-bold text-xs">{displayCoin}</span>
                      </div>
                    </div>
                    <div className="bg-white p-1.5 rounded-xl shadow-xs border border-slate-200/60 shrink-0">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${sampleAddress}`} 
                        alt="Payment QR Code" 
                        className="w-14 h-14" 
                      />
                    </div>
                  </div>

                  {/* Wallet Address (Always Visible) */}
                  <div className="px-0.5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9.5px] opacity-70 font-bold uppercase tracking-wider">{t('mockPaymentAddress')}</span>
                      <span 
                        className="text-[9.5px] font-bold flex items-center gap-1 cursor-default"
                        style={{ color: design.accentColor }}
                      >
                        <Copy size={10} />
                        <span>{language === 'es' ? 'Copiar Dirección' : 'Copy Address'}</span>
                      </span>
                    </div>
                    <div className="bg-current/5 border border-current/10 p-2.5 rounded-xl font-mono text-[10px] break-all select-all">
                      {sampleAddress}
                    </div>
                  </div>

                  {/* Network Warning Badge */}
                  <div className="flex items-start gap-2 bg-amber-50/60 border border-amber-200/60 rounded-xl p-3">
                    <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="text-[10px] text-amber-800 font-semibold leading-normal">
                      {language === 'es' 
                        ? `Por favor envíe ${displayCoin} exclusivamente a través de la red BNB Smart Chain (BEP-20). El uso de cualquier otra red resultará en la pérdida permanente de fondos.`
                        : `Please send ${displayCoin} exclusively via the BNB Smart Chain (BEP-20) network. Using any other network will result in permanent loss of funds.`}
                    </p>
                  </div>

                  {/* Optional Customer Note */}
                  {design.customerNote && (
                    <div className="p-2.5 bg-current/5 border border-current/10 rounded-xl text-[10.5px] font-medium leading-relaxed">
                      {design.customerNote}
                    </div>
                  )}

                  {/* Accordion Toggle */}
                  <button 
                    type="button"
                    onClick={() => setPreviewShowDetails(!previewShowDetails)}
                    className="w-full flex items-center justify-between px-1 py-0.5 text-[10px] font-bold opacity-60 hover:opacity-90 uppercase tracking-widest transition-opacity"
                  >
                    <span>{previewShowDetails ? (language === 'es' ? 'Ocultar Detalles' : 'Hide Invoice Details') : (language === 'es' ? 'Ver Detalles' : 'View Invoice Details')}</span>
                    <svg className={`w-3.5 h-3.5 transition-transform duration-300 ${previewShowDetails ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Accordion Content */}
                  {previewShowDetails && (
                    <div className="bg-current/5 border border-current/10 rounded-xl p-3 space-y-2.5 text-[10.5px]">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="opacity-60 text-[9px] font-bold uppercase tracking-wider mb-0.5">Invoice ID</p>
                          <p className="font-semibold font-mono">#INV-6A6E19</p>
                        </div>
                        <div>
                          <p className="opacity-60 text-[9px] font-bold uppercase tracking-wider mb-0.5">Order ID</p>
                          <p className="font-semibold truncate">{displayOrderId}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 border-t border-current/10 pt-2">
                        <div>
                          <p className="opacity-60 text-[9px] font-bold uppercase tracking-wider mb-0.5">{language === 'es' ? 'Facturado A' : 'Billed To'}</p>
                          <p className="font-semibold truncate">{displayCustomer}</p>
                        </div>
                        <div>
                          <p className="opacity-60 text-[9px] font-bold uppercase tracking-wider mb-0.5">{language === 'es' ? 'Correo' : 'Email'}</p>
                          <p className="font-semibold truncate">{displayEmail}</p>
                        </div>
                      </div>
                      {displayDescription && (
                        <div className="border-t border-current/10 pt-2">
                          <p className="opacity-60 text-[9px] font-bold uppercase tracking-wider mb-0.5">{language === 'es' ? 'Descripción' : 'Description'}</p>
                          <p className="leading-relaxed font-medium">{displayDescription}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Authentic Status State */}
                  <div className="mt-4 pt-3.5 border-t border-current/10 text-center flex flex-col items-center justify-center gap-1">
                    <RefreshCw size={15} className="animate-spin text-purple-600 mb-0.5" style={{ color: design.accentColor }} />
                    <p className="text-xs font-bold">{language === 'es' ? 'Esperando por su pago...' : 'Waiting for your payment...'}</p>
                    <p className="text-[10px] opacity-60 font-medium">{language === 'es' ? 'Por favor envíe la cantidad exacta a la dirección de arriba.' : 'Please send the exact amount to the address above.'}</p>
                  </div>
                </div>
              )}

            </div>

            {/* Simulated Copyright Footer */}
            <div className="mt-3 flex justify-between items-center px-3 text-[10px] font-semibold text-slate-400">
              <span>&copy; {new Date().getFullYear()} OrvixPay</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
