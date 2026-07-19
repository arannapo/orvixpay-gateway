"use client";

import { useState } from 'react';
import { BookOpen, Terminal, Webhook, Key, Check, Copy, ChevronRight, Hash, ArrowRight, ShieldAlert } from 'lucide-react';

export default function DocumentationPage() {
  const [activeLang, setActiveLang] = useState('curl');
  const [copied, setCopied] = useState('');
  const [activeSection, setActiveSection] = useState('auth');

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const APP_URL = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

  const codeSnippets = {
    create: {
      curl: `curl -X POST ${APP_URL}/api/invoice/create \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_SECRET_API_KEY" \\
  -d '{
    "amount": 50.00,
    "currency": "USD",
    "coin": "USDT",
    "orderId": "ORDER_98765",
    "customerName": "John Doe",
    "customerEmail": "customer@example.com",
    "description": "Premium Plan Subscription",
    "webhook": "https://your-domain.com/callbacks/payment",
    "successUrl": "https://your-domain.com/checkout/success",
    "cancelUrl": "https://your-domain.com/checkout/cancel"
  }'`,
      node: `const url = '${APP_URL}/api/invoice/create';
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_SECRET_API_KEY'
  },
  body: JSON.stringify({
    amount: 50.00,
    currency: 'USD',
    coin: 'USDT',
    orderId: 'ORDER_98765',
    customerName: 'John Doe',
    customerEmail: 'customer@example.com',
    description: 'Premium Plan Subscription',
    webhook: 'https://your-domain.com/callbacks/payment',
    successUrl: 'https://your-domain.com/checkout/success',
    cancelUrl: 'https://your-domain.com/checkout/cancel'
  })
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error(err));`,
      python: `import requests

url = "${APP_URL}/api/invoice/create"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_SECRET_API_KEY"
}
data = {
    "amount": 50.00,
    "currency": "USD",
    "coin": "USDT",
    "orderId": "ORDER_98765",
    "customerName": "John Doe",
    "customerEmail": "customer@example.com",
    "description": "Premium Plan Subscription",
    "webhook": "https://your-domain.com/callbacks/payment",
    "successUrl": "https://your-domain.com/checkout/success",
    "cancelUrl": "https://your-domain.com/checkout/cancel"
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`,
      php: `<?php

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${APP_URL}/api/invoice/create",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => json_encode([
    "amount" => 50.00,
    "currency" => "USD",
    "coin" => "USDT",
    "orderId" => "ORDER_98765",
    "customerName" => "John Doe",
    "customerEmail" => "customer@example.com",
    "description" => "Premium Plan Subscription",
    "webhook" => "https://your-domain.com/callbacks/payment",
    "successUrl" => "https://your-domain.com/checkout/success",
    "cancelUrl" => "https://your-domain.com/checkout/cancel"
  ]),
  CURLOPT_HTTPHEADER => [
    "Content-Type: application/json",
    "x-api-key: YOUR_SECRET_API_KEY"
  ],
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;`
    },
    getInvoice: {
      curl: `curl -X GET ${APP_URL}/api/invoice/64d2f8373b9e4a8123456789`,
      node: `const url = '${APP_URL}/api/invoice/64d2f8373b9e4a8123456789';

fetch(url)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error(err));`,
      python: `import requests

url = "${APP_URL}/api/invoice/64d2f8373b9e4a8123456789"
response = requests.get(url)
print(response.json())`,
      php: `<?php

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${APP_URL}/api/invoice/64d2f8373b9e4a8123456789",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "GET",
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;`
    }
  };

  const createInvoiceResponse = `{
  "success": true,
  "invoiceId": "64d2f8373b9e4a8123456789",
  "paymentAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "network": "BEP20",
  "coin": "USDT",
  "amount": 50.00,
  "expiresAt": "2026-07-19T16:11:16.000Z",
  "paymentUrl": "${APP_URL}/invoice/64d2f8373b9e4a8123456789"
}`;

  const getInvoiceResponse = `{
  "success": true,
  "invoice": {
    "_id": "64d2f8373b9e4a8123456789",
    "merchantId": {
      "_id": "64d2f8303b9e4a8123456700",
      "businessName": "Acme Corp",
      "logo": "${APP_URL}/uploads/logo.png",
      "website": "https://acme.com"
    },
    "orderId": "ORDER_98765",
    "customerName": "John Doe",
    "customerEmail": "customer@example.com",
    "description": "Premium Plan Subscription",
    "amount": 50.00,
    "currency": "USD",
    "usdtAmount": 50.00,
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "network": "BEP20",
    "coin": "USDT",
    "status": "Paid",
    "webhookUrl": "https://your-domain.com/callbacks/payment",
    "successUrl": "https://your-domain.com/checkout/success",
    "cancelUrl": "https://your-domain.com/checkout/cancel",
    "expiresAt": "2026-07-19T16:11:16.000Z",
    "createdAt": "2026-07-19T15:41:16.000Z",
    "paidAt": "2026-07-19T15:42:30.000Z"
  }
}`;

  const webhookSnippet = `{
  "event": "invoice.paid",
  "data": {
    "invoiceId": "64d2f8373b9e4a8123456789",
    "orderId": "ORDER_98765",
    "amount": 50.00,
    "currency": "USD",
    "coin": "USDT",
    "status": "Paid",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "invoiceUrl": "${APP_URL}/invoice/64d2f8373b9e4a8123456789",
    "successUrl": "https://your-domain.com/checkout/success",
    "cancelUrl": "https://your-domain.com/checkout/cancel",
    "blockchainTxId": "0x391f16da08c69...bd58",
    "paidAt": "2026-07-19T15:42:30.000Z",
    "customerEmail": "customer@example.com",
    "metadata": {
      "userId": "user_98765",
      "customField": "customValue"
    }
  }
}`;

  const sections = [
    { id: 'auth', label: 'Authentication', icon: Key },
    { id: 'create-invoice', label: 'Create Invoice', icon: Terminal },
    { id: 'get-invoice', label: 'Get Invoice Details', icon: BookOpen },
    { id: 'webhooks', label: 'Webhooks & Statuses', icon: Webhook }
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-2 md:py-6 font-sans">
      
      {/* Upper Banner / Header */}
      <div className="border-b border-slate-100 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-semibold tracking-wide mb-4">
          <BookOpen size={13} />
          Developer Suite
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">API Reference</h1>
        <p className="text-slate-500 max-w-3xl leading-relaxed text-sm md:text-base">
          Integrate secure, automated crypto payments into your existing flow. Our API follows RESTful structures, handles JSON request bodies, and responds with standard JSON payloads.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-[240px] shrink-0 space-y-1 lg:sticky lg:top-8 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Documentation Sections</p>
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveSection(sec.id);
                  const el = document.getElementById(sec.id);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all ${
                  activeSection === sec.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={15} />
                <span>{sec.label}</span>
                <ChevronRight size={14} className="ml-auto opacity-40" />
              </button>
            );
          })}
        </aside>

        {/* Documentation Content */}
        <div className="flex-1 space-y-16 min-w-0 max-w-full">

          {/* Section: Authentication */}
          <section id="auth" className="scroll-mt-6 border-b border-slate-100 pb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 rounded-xl"><Key size={18} className="text-slate-800" /></div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Authentication</h2>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-5">
              <div className="text-slate-600 space-y-4 text-xs md:text-sm leading-relaxed">
                <p>
                  To authenticate API calls, you must include your active secret API key in the request headers. 
                  Generate and rotate your API credentials within the <strong>API Credentials</strong> menu inside the Settings workspace.
                </p>
                <p className="p-3.5 bg-rose-50/50 text-rose-800 border border-rose-100 rounded-xl flex items-start gap-3">
                  <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                  <span>
                    <strong>Warning:</strong> Treat your secret key as a password. Never share it, publish it in client-side code repositories, or expose it in web applications.
                  </span>
                </p>
                <p>
                  Ensure your backend environment forces requests via secure <code>HTTPS</code> protocols. Standard unencrypted <code>HTTP</code> requests will automatically be blocked.
                </p>
              </div>

              {/* Header Box */}
              <div className="bg-[#0b0f19] rounded-2xl overflow-hidden border border-slate-800/60 shadow-xl self-start">
                <div className="flex justify-between items-center px-4 py-2.5 bg-[#151b2d] border-b border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-bold tracking-wide uppercase">Request Header Example</span>
                  <button 
                    onClick={() => handleCopy("x-api-key: YOUR_SECRET_API_KEY", "header")}
                    className="p-1 hover:bg-[#202940] rounded text-slate-400 hover:text-white transition"
                  >
                    {copied === "header" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="p-5 font-mono text-xs overflow-x-auto">
                  <code className="text-emerald-400 font-semibold block">x-api-key: <span className="text-indigo-300">op_live_8f3d...4b9a</span></code>
                  <code className="text-slate-500 block mt-1">Content-Type: application/json</code>
                </div>
              </div>
            </div>
          </section>


          {/* Section: Create Invoice */}
          <section id="create-invoice" className="scroll-mt-6 border-b border-slate-100 pb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-xl"><Terminal size={18} className="text-slate-800" /></div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Create Invoice</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white font-extrabold px-2.5 py-1 rounded-md text-[10px] tracking-wider uppercase">POST</span>
                <code className="text-xs bg-slate-100 text-slate-900 font-semibold px-2 py-1 rounded border border-slate-200">/api/invoice/create</code>
              </div>
            </div>

            <p className="text-slate-500 text-xs md:text-sm mb-6 max-w-2xl leading-relaxed">
              Creates a dynamic, temporary crypto receiving address for a specific order. The response includes a transaction-specific <strong>paymentUrl</strong> which hosts the OrvixPay checkout interface.
            </p>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Parameters Column */}
              <div className="xl:col-span-6 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">Body Parameters</h3>
                
                <div className="space-y-4">
                  {/* Parameter Entry */}
                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">amount</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">number</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full inline-block mb-1.5">Required</span>
                    <p className="text-xs text-slate-600 leading-normal">The absolute fiat amount to charge (e.g. <code>25.50</code>).</p>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">currency</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">string</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full inline-block mb-1.5">Required</span>
                    <p className="text-xs text-slate-600 leading-normal">Three-letter ISO fiat code. Supports major codes like <code>USD</code>, <code>EUR</code>, etc.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">coin</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">string</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full inline-block mb-1.5">Required</span>
                    <p className="text-xs text-slate-600 leading-normal">Asset coin. Accepts <code>USDT</code> or <code>USDC</code> (BEP20 Binance Smart Chain network).</p>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">orderId</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">string</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full inline-block mb-1.5">Required</span>
                    <p className="text-xs text-slate-600 leading-normal">Your internal business reference ID. Must be unique per checkout event.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">customerName</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">string</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full inline-block mb-1.5">Optional</span>
                    <p className="text-xs text-slate-600 leading-normal">The customer's name, displayed on receipts and checkout panels.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">customerEmail</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">string</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full inline-block mb-1.5">Required</span>
                    <p className="text-xs text-slate-600 leading-normal">Customer email for sending automated payment confirmation emails.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">description</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">string</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full inline-block mb-1.5">Optional</span>
                    <p className="text-xs text-slate-600 leading-normal">Brief summary description about the checkout item or payment reason.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">webhook</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">string</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full inline-block mb-1.5">Optional</span>
                    <p className="text-xs text-slate-600 leading-normal">Overrides your global system webhook URL to notify this specific checkout event.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">successUrl / cancelUrl</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">string</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full inline-block mb-1.5">Optional</span>
                    <p className="text-xs text-slate-600 leading-normal">Target URLs to redirect the customer to upon completion or cancellation.</p>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">metadata</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">object</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded-full inline-block mb-1.5">Optional</span>
                    <p className="text-xs text-slate-600 leading-normal">Custom key-value pairs to store extra structured data (e.g. <code>{"{ \"userId\": 123 }"}</code>). Returned back in webhooks.</p>
                  </div>
                </div>
              </div>

              {/* Code Snippets Column */}
              <div className="xl:col-span-6 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">Request & Response Code</h3>
                
                {/* Language Switcher */}
                <div className="bg-[#0b0f19] rounded-2xl overflow-hidden border border-slate-800/60 shadow-xl">
                  <div className="flex justify-between items-center px-3 py-2 bg-[#151b2d] border-b border-slate-800/80">
                    <div className="flex gap-1">
                      {['curl', 'node', 'python', 'php'].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setActiveLang(lang)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            activeLang === lang
                              ? 'bg-slate-800 text-white shadow-inner'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleCopy(codeSnippets.create[activeLang], 'create_code')}
                      className="p-1 hover:bg-[#202940] rounded text-slate-400 hover:text-white transition"
                    >
                      {copied === 'create_code' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="p-4 font-mono text-xs overflow-x-auto max-h-[300px] scrollbar-thin">
                    <pre className="text-slate-300 whitespace-pre">{codeSnippets.create[activeLang]}</pre>
                  </div>
                </div>

                {/* Response Code Block */}
                <div className="bg-[#0b0f19] rounded-2xl overflow-hidden border border-slate-800/60 shadow-xl">
                  <div className="px-4 py-2.5 bg-[#151b2d] border-b border-slate-800/80 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">RESPONSE (200 OK)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="p-4 font-mono text-xs overflow-x-auto max-h-[300px]">
                    <pre className="text-emerald-400">{createInvoiceResponse}</pre>
                  </div>
                </div>
              </div>

            </div>
          </section>


          {/* Section: Get Invoice Details */}
          <section id="get-invoice" className="scroll-mt-6 border-b border-slate-100 pb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-xl"><BookOpen size={18} className="text-slate-800" /></div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Get Invoice Details</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white font-extrabold px-2.5 py-1 rounded-md text-[10px] tracking-wider uppercase">GET</span>
                <code className="text-xs bg-slate-100 text-slate-900 font-semibold px-2 py-1 rounded border border-slate-200">/api/invoice/[id]</code>
              </div>
            </div>

            <p className="text-slate-500 text-xs md:text-sm mb-6 max-w-2xl leading-relaxed">
              Retrieve real-time status and checkout statistics for a specific invoice using its unique alphanumeric <code>invoiceId</code>. This endpoint is public and does not require an authentication key.
            </p>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Parameters / Path params */}
              <div className="xl:col-span-6 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">Path Parameters</h3>
                
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900">id</span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">string</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full inline-block mb-2">Required</span>
                  <p className="text-xs text-slate-600 leading-normal">
                    The unique object ID of the target invoice (e.g. <code>64d2f8373b9e4a8123456789</code>).
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs leading-relaxed text-slate-600">
                  <p className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                    <Hash size={14} className="text-slate-400" /> Use Cases:
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5 mt-1.5 text-slate-500">
                    <li>Polling payment status from a client-side frontend.</li>
                    <li>Verifying receipt status in custom customer order pages.</li>
                    <li>Viewing associated blockchain network transaction hashes.</li>
                  </ul>
                </div>
              </div>

              {/* Code Snippets Column */}
              <div className="xl:col-span-6 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">Request & Response Code</h3>
                
                {/* Language Switcher */}
                <div className="bg-[#0b0f19] rounded-2xl overflow-hidden border border-slate-800/60 shadow-xl">
                  <div className="flex justify-between items-center px-3 py-2 bg-[#151b2d] border-b border-slate-800/80">
                    <div className="flex gap-1">
                      {['curl', 'node', 'python', 'php'].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setActiveLang(lang)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                            activeLang === lang
                              ? 'bg-slate-800 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {lang.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={() => handleCopy(codeSnippets.getInvoice[activeLang], 'get_code')}
                      className="p-1 hover:bg-[#202940] rounded text-slate-400 hover:text-white transition"
                    >
                      {copied === 'get_code' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="p-4 font-mono text-xs overflow-x-auto max-h-[300px]">
                    <pre className="text-slate-300 whitespace-pre">{codeSnippets.getInvoice[activeLang]}</pre>
                  </div>
                </div>

                {/* Response Code Block */}
                <div className="bg-[#0b0f19] rounded-2xl overflow-hidden border border-slate-800/60 shadow-xl">
                  <div className="px-4 py-2.5 bg-[#151b2d] border-b border-slate-800/80 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">RESPONSE (200 OK)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="p-4 font-mono text-xs overflow-x-auto max-h-[320px]">
                    <pre className="text-emerald-400">{getInvoiceResponse}</pre>
                  </div>
                </div>
              </div>

            </div>
          </section>


          {/* Section: Webhooks & Statuses */}
          <section id="webhooks" className="scroll-mt-6 pb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 rounded-xl"><Webhook size={18} className="text-slate-800" /></div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Webhooks & Event Lifecycle</h2>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start mt-6">
              
              <div className="text-slate-600 leading-relaxed text-xs md:text-sm space-y-4">
                <p>
                  Webhooks are the recommended integration strategy for capturing asynchronous payment events. Define your standard receiver endpoint within the <strong>Developer Options</strong> segment in Settings.
                </p>
                <p>
                  Once an invoice successfully transitions to <code>Paid</code> on the blockchain network, OrvixPay sends a secure HTTP <code>POST</code> request with a JSON body to your endpoint.
                </p>
                
                {/* Event Lifecycles */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 text-xs mb-2">Supported Invoice Statuses</h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5"><ArrowRight size={12} className="text-indigo-500" /> Pending (Waiting payment)</span>
                    <span className="flex items-center gap-1.5"><ArrowRight size={12} className="text-indigo-500" /> Confirming (Verifying on-chain)</span>
                    <span className="flex items-center gap-1.5"><ArrowRight size={12} className="text-indigo-500" /> Paid (Complete & successful)</span>
                    <span className="flex items-center gap-1.5"><ArrowRight size={12} className="text-indigo-500" /> Expired (Not paid within 30 min)</span>
                    <span className="flex items-center gap-1.5"><ArrowRight size={12} className="text-indigo-500" /> Partially Paid (Incorrect amount)</span>
                    <span className="flex items-center gap-1.5"><ArrowRight size={12} className="text-indigo-500" /> Cancelled (Voided by merchant)</span>
                  </div>
                </div>

                <p className="p-4 bg-amber-50/70 text-amber-800 border border-amber-100 rounded-xl text-xs">
                  <strong>Verification Tip:</strong> Confirm the received <code>orderId</code> is valid and the <code>amount</code> matches the expectation of your database record prior to releasing services or goods.
                </p>
              </div>

              {/* Webhook Payload Box */}
              <div className="bg-[#0b0f19] rounded-2xl overflow-hidden border border-slate-800/60 shadow-xl">
                <div className="px-4 py-3 bg-[#151b2d] border-b border-slate-800/80 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-bold tracking-wide uppercase">Webhook Payload Schema</span>
                  <button 
                    onClick={() => handleCopy(webhookSnippet, 'webhook')}
                    className="p-1 hover:bg-[#202940] rounded text-slate-400 hover:text-white transition"
                  >
                    {copied === 'webhook' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="p-4 font-mono text-xs overflow-x-auto max-h-[350px]">
                  <pre className="text-emerald-400">{webhookSnippet}</pre>
                </div>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
