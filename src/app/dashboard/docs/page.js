"use client";

import { useState } from 'react';
import { 
  BookOpen, 
  Terminal, 
  Webhook, 
  Key, 
  Check, 
  Copy, 
  ChevronRight, 
  Hash, 
  ArrowRight, 
  ShieldAlert,
  Send,
  Layers,
  Wallet,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function DocumentationPage() {
  const { t, language } = useLanguage();
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
      node: `fetch('${APP_URL}/api/invoice/64d2f8373b9e4a8123456789')
  .then(res => res.json())
  .then(json => console.log(json));`,
      python: `import requests
response = requests.get("${APP_URL}/api/invoice/64d2f8373b9e4a8123456789")
print(response.json())`,
      php: `<?php
$response = file_get_contents("${APP_URL}/api/invoice/64d2f8373b9e4a8123456789");
echo $response;`
    },
    massPayout: {
      curl: `curl -X POST ${APP_URL}/api/payouts \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_SECRET_API_KEY" \\
  -d '{
    "coin": "USDT",
    "recipients": [
      {
        "address": "0x71C8705775502e33644243b95a04381cf3a60a88",
        "amount": 50.00,
        "memo": "Affiliate Reward"
      },
      {
        "address": "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1",
        "amount": 120.50,
        "memo": "Monthly Bonus"
      },
      {
        "address": "0xdD870fA1b7C4700F2BD7f44238821C26f7392148",
        "amount": 25.00,
        "memo": "Referral"
      }
    ]
  }'`,
      node: `const url = '${APP_URL}/api/payouts';
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_SECRET_API_KEY'
  },
  body: JSON.stringify({
    coin: 'USDT',
    recipients: [
      { address: '0x71C8705775502e33644243b95a04381cf3a60a88', amount: 50.00, memo: 'Affiliate Reward' },
      { address: '0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1', amount: 120.50, memo: 'Monthly Bonus' },
      { address: '0xdD870fA1b7C4700F2BD7f44238821C26f7392148', amount: 25.00, memo: 'Referral' }
    ]
  })
};

fetch(url, options)
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(err => console.error(err));`,
      python: `import requests

url = "${APP_URL}/api/payouts"
headers = {
    "Content-Type": "application/json",
    "x-api-key": "YOUR_SECRET_API_KEY"
}
data = {
    "coin": "USDT",
    "recipients": [
        {"address": "0x71C8705775502e33644243b95a04381cf3a60a88", "amount": 50.00, "memo": "Affiliate Reward"},
        {"address": "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1", "amount": 120.50, "memo": "Monthly Bonus"},
        {"address": "0xdD870fA1b7C4700F2BD7f44238821C26f7392148", "amount": 25.00, "memo": "Referral"}
    ]
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`,
      php: `<?php

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${APP_URL}/api/payouts",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "POST",
  CURLOPT_POSTFIELDS => json_encode([
    "coin" => "USDT",
    "recipients" => [
      ["address" => "0x71C8705775502e33644243b95a04381cf3a60a88", "amount" => 50.00, "memo" => "Affiliate Reward"],
      ["address" => "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1", "amount" => 120.50, "memo" => "Monthly Bonus"],
      ["address" => "0xdD870fA1b7C4700F2BD7f44238821C26f7392148", "amount" => 25.00, "memo" => "Referral"]
    ]
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
    getPayouts: {
      curl: `curl -X GET ${APP_URL}/api/payouts \\
  -H "x-api-key: YOUR_SECRET_API_KEY"`,
      node: `fetch('${APP_URL}/api/payouts', {
  headers: {
    'x-api-key': 'YOUR_SECRET_API_KEY'
  }
})
  .then(res => res.json())
  .then(json => console.log(json));`,
      python: `import requests

headers = {
    "x-api-key": "YOUR_SECRET_API_KEY"
}
response = requests.get("${APP_URL}/api/payouts", headers=headers)
print(response.json())`,
      php: `<?php

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${APP_URL}/api/payouts",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "GET",
  CURLOPT_HTTPHEADER => [
    "x-api-key: YOUR_SECRET_API_KEY"
  ],
]);

$response = curl_exec($curl);
curl_close($curl);
echo $response;`
    }
  };

  const createInvoiceResponse = `{
  "success": true,
  "invoiceId": "64d2f8373b9e4a8123456789",
  "paymentUrl": "${APP_URL}/invoice/64d2f8373b9e4a8123456789"
}`;

  const getInvoiceResponse = `{
  "success": true,
  "invoice": {
    "_id": "64d2f8373b9e4a8123456789",
    "amount": 50.00,
    "currency": "USD",
    "coin": "USDT",
    "orderId": "ORDER_98765",
    "walletAddress": "0x752A180d...55d398",
    "status": "Pending",
    "customerName": "John Doe",
    "customerEmail": "customer@example.com",
    "description": "Premium Plan Subscription",
    "createdAt": "2026-07-20T03:10:04Z",
    "expiresAt": "2026-07-20T03:40:04Z"
  }
}`;

  const massPayoutResponse = `{
  "success": true,
  "batchId": "PAY_719401_A8B3C",
  "coin": "USDT",
  "totalAmount": 195.50,
  "recipientsCount": 3,
  "status": "Completed",
  "txHash": "0x8f3d4b9a12e56789abcdef0123456789abcdef0123456789abcdef0123456789"
}`;

  const getPayoutsResponse = `{
  "success": true,
  "systemWallet": {
    "address": "0xda61e78A4A3be11d8Cfd90BBE41d32BD877930Ba",
    "bnbBalance": "0.0450",
    "usdtBalance": "1250.00",
    "usdcBalance": "500.00"
  },
  "stats": {
    "totalDisbursed": 4350.00,
    "completedBatches": 12,
    "totalRecipients": 84,
    "totalBatches": 12
  },
  "payouts": [
    {
      "batchId": "PAY_719401_A8B3C",
      "coin": "USDT",
      "totalAmount": 195.50,
      "recipientsCount": 3,
      "status": "Completed",
      "txHash": "0x8f3d4b9a12e56789...",
      "createdAt": "2026-10-17T03:15:00.000Z"
    }
  ]
}`;

  const webhookSnippet = `{
  "event": "invoice.paid",
  "invoiceId": "64d2f8373b9e4a8123456789",
  "orderId": "ORDER_98765",
  "amount": 50.00,
  "coin": "USDT",
  "txHash": "0x8f3d...4b9a",
  "timestamp": "2026-07-20T03:12:04Z",
  "metadata": {
    "userId": "user_98765",
    "customField": "customValue"
  }
}`;

  const sections = [
    { id: 'auth', label: language === 'es' ? 'Autenticación' : 'Authentication', icon: Key },
    { id: 'create-invoice', label: language === 'es' ? 'Crear Factura' : 'Create Invoice', icon: Terminal },
    { id: 'get-invoice', label: language === 'es' ? 'Detalles de Factura' : 'Get Invoice Details', icon: BookOpen },
    { id: 'mass-payout', label: language === 'es' ? 'Dispersión Masiva (Payouts)' : 'Execute Mass Payout', icon: Send },
    { id: 'payout-balances', label: language === 'es' ? 'Saldos de Payout y Lotes' : 'Payout Balances & Batches', icon: Layers },
    { id: 'webhooks', label: language === 'es' ? 'Webhooks y Estados' : 'Webhooks & Statuses', icon: Webhook }
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-2 md:py-6 font-sans">
      
      {/* Upper Banner / Header */}
      <div className="border-b border-slate-100 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-semibold tracking-wide mb-4">
          <BookOpen size={13} />
          {language === 'es' ? 'Suite de Desarrollador' : 'Developer Suite'}
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          {language === 'es' ? 'Referencia de API' : 'API Reference'}
        </h1>
        <p className="text-slate-500 max-w-3xl leading-relaxed text-sm md:text-base">
          {language === 'es' 
            ? 'Integre cobros y dispersiones masivas de criptomonedas directamente en su plataforma. Nuestra API sigue estándares RESTful, procesa cuerpos en JSON y se ejecuta de forma segura en BNB Smart Chain.' 
            : 'Integrate automated crypto checkouts and batch mass payouts directly into your platform. Our API follows RESTful conventions, handles JSON payloads, and runs securely on BNB Smart Chain.'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-[260px] shrink-0 space-y-1 lg:sticky lg:top-8 bg-slate-50/50 p-2.5 rounded-2xl border border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
            {language === 'es' ? 'Secciones de Documentación' : 'Documentation Sections'}
          </p>
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
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {language === 'es' ? 'Autenticación' : 'Authentication'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-5">
              <div className="text-slate-600 space-y-4 text-xs md:text-sm leading-relaxed">
                <p>
                  {language === 'es'
                    ? 'Para autenticar las llamadas a la API, debe incluir su clave API secreta activa en los encabezados de la solicitud mediante el encabezado x-api-key. Genere y gestione sus credenciales de API desde el panel de Configuración en Credenciales de API.'
                    : 'To authenticate API calls, you must include your active secret API key in the request headers via the x-api-key header. Generate and manage your API credentials in the Settings workspace under API Credentials.'}
                </p>
                <div className="p-3.5 bg-rose-50/50 text-rose-800 border border-rose-100 rounded-xl flex items-start gap-3">
                  <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                  <span>
                    <strong>{language === 'es' ? 'Advertencia:' : 'Warning:'}</strong> {language === 'es' ? 'Trate su clave secreta como una contraseña. Nunca la comparta, la publique en repositorios del lado del cliente ni la exponga en aplicaciones web.' : 'Treat your secret key as a password. Never share it, publish it in client-side code repositories, or expose it in web applications.'}
                  </span>
                </div>
                <p>
                  {language === 'es'
                    ? 'Asegúrese de que su entorno de backend fuerce solicitudes a través de protocolos HTTPS seguros. Las solicitudes HTTP estándar no cifradas se bloquearán automáticamente.'
                    : 'Ensure your backend environment forces requests via secure HTTPS protocols. Standard unencrypted HTTP requests will automatically be blocked.'}
                </p>
              </div>

              {/* Header Box */}
              <div className="bg-[#0b0f19] rounded-2xl overflow-hidden border border-slate-800/60 shadow-xl self-start">
                <div className="flex justify-between items-center px-4 py-2.5 bg-[#151b2d] border-b border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-bold tracking-wide uppercase">
                    {language === 'es' ? 'Ejemplo de Encabezado' : 'Request Header Example'}
                  </span>
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
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  {language === 'es' ? 'Crear Factura' : 'Create Invoice'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white font-extrabold px-2.5 py-1 rounded-md text-[10px] tracking-wider uppercase">POST</span>
                <code className="text-xs bg-slate-100 text-slate-900 font-semibold px-2 py-1 rounded border border-slate-200">/api/invoice/create</code>
              </div>
            </div>

            <p className="text-slate-500 text-xs md:text-sm mb-6 max-w-2xl leading-relaxed">
              {language === 'es'
                ? 'Crea una dirección de recepción temporal y dinámica para un pedido específico. La respuesta incluye una URL de pago específica de la transacción que aloja la interfaz de OrvixPay.'
                : 'Creates a dynamic, temporary crypto receiving address for a specific order. The response includes a transaction-specific paymentUrl which hosts the OrvixPay checkout interface.'}
            </p>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Parameters Column */}
              <div className="xl:col-span-6 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">
                  {language === 'es' ? 'Parámetros del Cuerpo' : 'Body Parameters'}
                </h3>
                
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">amount</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">number</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full inline-block mb-1.5">
                      {language === 'es' ? 'Requerido' : 'Required'}
                    </span>
                    <p className="text-xs text-slate-655 leading-normal">
                      {language === 'es' ? 'El monto fiat absoluto a cobrar (por ejemplo, 25.50).' : 'The absolute fiat amount to charge (e.g. 25.50).'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">currency</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">string</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full inline-block mb-1.5">
                      {language === 'es' ? 'Requerido' : 'Required'}
                    </span>
                    <p className="text-xs text-slate-655 leading-normal">
                      {language === 'es' ? 'Código fiat ISO de tres letras. Soporta los principales códigos como USD, EUR, etc.' : 'Three-letter ISO fiat code. Supports major codes like USD, EUR, etc.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">coin</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">string</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full inline-block mb-1.5">
                      {language === 'es' ? 'Requerido' : 'Required'}
                    </span>
                    <p className="text-xs text-slate-655 leading-normal">
                      {language === 'es' ? 'Moneda de cobro. Acepta USDT o USDC (red BSC/BEP20 BNB Smart Chain).' : 'Asset coin. Accepts USDT or USDC (BEP20 BNB Smart Chain network).'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">orderId</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">string</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full inline-block mb-1.5">
                      {language === 'es' ? 'Requerido' : 'Required'}
                    </span>
                    <p className="text-xs text-slate-655 leading-normal">
                      {language === 'es' ? 'Su ID de referencia comercial interna. Debe ser única para cada pago.' : 'Your internal business reference ID. Must be unique per checkout event.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">customerEmail</span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase">string</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full inline-block mb-1.5">
                      {language === 'es' ? 'Requerido' : 'Required'}
                    </span>
                    <p className="text-xs text-slate-655 leading-normal">
                      {language === 'es' ? 'Correo electrónico del cliente para enviar correos automáticos de confirmación.' : 'Customer email for sending automated payment confirmation emails.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Code Snippets Column */}
              <div className="xl:col-span-6 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">
                  {language === 'es' ? 'Código de Solicitud y Respuesta' : 'Request & Response Code'}
                </h3>
                
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
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                  {language === 'es' ? 'Obtener Detalles de Factura' : 'Get Invoice Details'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white font-extrabold px-2.5 py-1 rounded-md text-[10px] tracking-wider uppercase">GET</span>
                <code className="text-xs bg-slate-100 text-slate-900 font-semibold px-2 py-1 rounded border border-slate-200">/api/invoice/[id]</code>
              </div>
            </div>

            <p className="text-slate-500 text-xs md:text-sm mb-6 max-w-2xl leading-relaxed">
              {language === 'es'
                ? 'Obtenga el estado y las estadísticas de un pago en tiempo real utilizando su ID de factura único. Este endpoint es público y no requiere clave de autenticación.'
                : 'Retrieve real-time status and checkout statistics for a specific invoice using its unique alphanumeric invoiceId. This endpoint is public and does not require an authentication key.'}
            </p>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Parameters / Path params */}
              <div className="xl:col-span-6 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">
                  {language === 'es' ? 'Parámetros de Ruta' : 'Path Parameters'}
                </h3>
                
                <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-900">id</span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">string</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full inline-block mb-2">
                    {language === 'es' ? 'Requerido' : 'Required'}
                  </span>
                  <p className="text-xs text-slate-655 leading-normal">
                    {language === 'es' ? 'El ID de objeto único de la factura de destino.' : 'The unique object ID of the target invoice.'}
                  </p>
                </div>
              </div>

              {/* Code Snippets Column */}
              <div className="xl:col-span-6 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">
                  {language === 'es' ? 'Código de Solicitud y Respuesta' : 'Request & Response Code'}
                </h3>
                
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


          {/* ══════════════════════════════════════════════════════════════ */}
          {/* Section: Mass Payout (Execute Batch Payouts) */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <section id="mass-payout" className="scroll-mt-6 border-b border-slate-100 pb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-xl"><Send size={18} className="text-slate-800" /></div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                    {language === 'es' ? 'Ejecutar Pago Masivo (Mass Payout)' : 'Execute Mass Payout'}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-600 text-white font-extrabold px-2.5 py-1 rounded-md text-[10px] tracking-wider uppercase">POST</span>
                <code className="text-xs bg-slate-100 text-slate-900 font-semibold px-2 py-1 rounded border border-slate-200">/api/payouts</code>
              </div>
            </div>

            <p className="text-slate-500 text-xs md:text-sm mb-6 max-w-3xl leading-relaxed">
              {language === 'es'
                ? 'Disperse transferencias de tokens cripto BEP-20 (USDT o USDC) por lotes a múltiples direcciones de billetera en una sola llamada de API. Las transacciones se firman y envían automáticamente en BNB Smart Chain utilizando los fondos y gas de su Billetera del Sistema.'
                : 'Disburse batch BEP-20 token transfers (USDT or USDC) to multiple recipient wallet addresses in a single automated API call. Transactions are signed and broadcast directly on BNB Smart Chain using the funds and gas from your System Wallet.'}
            </p>

            {/* Architecture Tip / System Gas Wallet Card */}
            <div className="mb-8 p-4 bg-purple-50/60 border border-purple-100 rounded-2xl flex items-start gap-3.5">
              <Wallet size={20} className="text-purple-600 shrink-0 mt-0.5" />
              <div className="text-xs md:text-sm text-slate-700 space-y-1">
                <strong className="text-slate-900 font-bold block">
                  {language === 'es' ? 'Modelo de Billetera del Sistema (Gas & Saldo BEP-20):' : 'System Gas Wallet Execution Model:'}
                </strong>
                <p className="text-slate-600 leading-normal">
                  {language === 'es'
                    ? 'Cada comercio cuenta con una Billetera del Sistema BEP-20 única. Para ejecutar pagos masivos, asegúrese de haber depositado el token de dispersión (USDT o USDC) y una pequeña reserva de BNB para cubrir las tarifas de gas de la red BSC. Todas las transferencias se realizan en la cadena nativa con hashes de transacción de BscScan verificables.'
                    : 'Each merchant has a dedicated BEP-20 System Wallet. To execute batch payouts, ensure you have deposited your payout tokens (USDT or USDC) and a modest BNB reserve for BSC network gas fees. All transfers execute natively on-chain with transparent, verifiable BscScan transaction hashes.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Parameters Column */}
              <div className="xl:col-span-6 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">
                  {language === 'es' ? 'Parámetros del Cuerpo (Body JSON)' : 'Body JSON Parameters'}
                </h3>
                
                <div className="space-y-4">
                  {/* coin */}
                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">coin</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">string</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full inline-block mb-1.5">
                      {language === 'es' ? 'Requerido' : 'Required'}
                    </span>
                    <p className="text-xs text-slate-655 leading-normal">
                      {language === 'es'
                        ? 'Token a dispersar en la red BNB Smart Chain. Valores aceptados: "USDT", "USDC" o "BNB".'
                        : 'Token asset to disburse on BNB Smart Chain. Accepted values: "USDT", "USDC", or "BNB".'}
                    </p>
                  </div>

                  {/* recipients */}
                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-slate-900">recipients</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">array of objects</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-full inline-block mb-1.5">
                      {language === 'es' ? 'Requerido' : 'Required'}
                    </span>
                    <p className="text-xs text-slate-655 leading-normal mb-2">
                      {language === 'es'
                        ? 'Arreglo con la lista de destinatarios. Debe contener al menos un destinatario válido.'
                        : 'Array containing the list of recipients. Must contain at least one valid recipient object.'}
                    </p>

                    {/* Sub-fields */}
                    <div className="space-y-2 mt-2 pt-2 border-t border-slate-200/60 pl-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] font-bold text-slate-800">recipients[].address</code>
                          <span className="text-[9px] text-indigo-600 font-semibold uppercase">string</span>
                          <span className="text-[8px] bg-rose-50 text-rose-600 font-bold px-1 rounded uppercase">Required</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {language === 'es' ? 'Dirección de billetera BEP-20 válida (formato 0x).' : 'Valid BEP-20 wallet address (0x format).'}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] font-bold text-slate-800">recipients[].amount</code>
                          <span className="text-[9px] text-indigo-600 font-semibold uppercase">number</span>
                          <span className="text-[8px] bg-rose-50 text-rose-600 font-bold px-1 rounded uppercase">Required</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {language === 'es' ? 'Monto decimal positivo a transferir al destinatario.' : 'Positive decimal token amount to transfer.'}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <code className="text-[11px] font-bold text-slate-800">recipients[].memo</code>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase">string</span>
                          <span className="text-[8px] bg-slate-100 text-slate-500 font-bold px-1 rounded uppercase">Optional</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {language === 'es' ? 'Nota interna, etiqueta o motivo del pago (ej. Salario, Afiliado #102).' : 'Internal note, reference tag, or payout reason (e.g. Affiliate #102).'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Code Snippets Column */}
              <div className="xl:col-span-6 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">
                  {language === 'es' ? 'Código de Solicitud y Respuesta' : 'Request & Response Code'}
                </h3>
                
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
                      onClick={() => handleCopy(codeSnippets.massPayout[activeLang], 'payout_code')}
                      className="p-1 hover:bg-[#202940] rounded text-slate-400 hover:text-white transition"
                    >
                      {copied === 'payout_code' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="p-4 font-mono text-xs overflow-x-auto max-h-[300px] scrollbar-thin">
                    <pre className="text-slate-300 whitespace-pre">{codeSnippets.massPayout[activeLang]}</pre>
                  </div>
                </div>

                {/* Response Code Block */}
                <div className="bg-[#0b0f19] rounded-2xl overflow-hidden border border-slate-800/60 shadow-xl">
                  <div className="px-4 py-2.5 bg-[#151b2d] border-b border-slate-800/80 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">RESPONSE (200 OK)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="p-4 font-mono text-xs overflow-x-auto max-h-[300px]">
                    <pre className="text-emerald-400">{massPayoutResponse}</pre>
                  </div>
                </div>
              </div>

            </div>
          </section>


          {/* ══════════════════════════════════════════════════════════════ */}
          {/* Section: Get Payout Balances & History */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <section id="payout-balances" className="scroll-mt-6 border-b border-slate-100 pb-12">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-xl"><Layers size={18} className="text-slate-800" /></div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                    {language === 'es' ? 'Consultar Saldos y Lotes de Payout' : 'Get Payout Balances & Batches'}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-600 text-white font-extrabold px-2.5 py-1 rounded-md text-[10px] tracking-wider uppercase">GET</span>
                <code className="text-xs bg-slate-100 text-slate-900 font-semibold px-2 py-1 rounded border border-slate-200">/api/payouts</code>
              </div>
            </div>

            <p className="text-slate-500 text-xs md:text-sm mb-6 max-w-3xl leading-relaxed">
              {language === 'es'
                ? 'Consulte los saldos en vivo de su Billetera del Sistema (USDT, USDC y BNB para gas), estadísticas acumuladas de dispersión y la lista completa de lotes ejecutados.'
                : 'Retrieve live on-chain balances for your System Wallet (USDT, USDC, and BNB gas reserve), total disbursement statistics, and the full history of executed payout batches.'}
            </p>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              
              {/* Information Column */}
              <div className="xl:col-span-6 space-y-4 text-xs md:text-sm text-slate-655 leading-relaxed">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pb-1 border-b border-slate-100">
                  {language === 'es' ? 'Detalles de Respuesta' : 'Response Object Schema'}
                </h3>

                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <code className="text-xs font-bold text-slate-900 block font-mono">systemWallet</code>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'es'
                        ? 'Contiene la dirección BEP-20 de la billetera del sistema y los saldos en vivo de BNB (gas), USDT y USDC.'
                        : 'Contains the System Wallet BEP-20 address and live balances for BNB (gas), USDT, and USDC.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <code className="text-xs font-bold text-slate-900 block font-mono">stats</code>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'es'
                        ? 'Métricas agregadas: totalDisbursed (monto acumulado), completedBatches y totalRecipients.'
                        : 'Aggregated metrics: totalDisbursed (cumulative amount), completedBatches, and totalRecipients.'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100">
                    <code className="text-xs font-bold text-slate-900 block font-mono">payouts</code>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'es'
                        ? 'Lista de lotes anteriores con sus respectivos batchId, txHash on-chain, fecha y estado.'
                        : 'List of past batches including batchId, on-chain txHash, timestamp, and status.'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600">
                  <strong className="text-slate-900 block mb-1 font-bold">
                    {language === 'es' ? 'Manejo de Errores y Validaciones:' : 'Error Handling & Validations:'}
                  </strong>
                  <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[11px]">
                    <li><strong>400 Bad Request:</strong> {language === 'es' ? 'Dirección EVM inválida o monto menor o igual a cero.' : 'Invalid EVM recipient address or non-positive amount.'}</li>
                    <li><strong>400 Insufficient Balance:</strong> {language === 'es' ? 'El saldo de USDT o USDC en la billetera es menor al monto total a dispersar.' : 'System wallet token balance is insufficient for total amount.'}</li>
                    <li><strong>400 Insufficient Gas:</strong> {language === 'es' ? 'El saldo de BNB en la billetera es menor al gas estimado para la transacción.' : 'System wallet BNB gas reserve is insufficient for transaction fee.'}</li>
                    <li><strong>401 Unauthorized:</strong> {language === 'es' ? 'Encabezado x-api-key ausente o clave API inactiva.' : 'Missing or invalid x-api-key header.'}</li>
                  </ul>
                </div>
              </div>

              {/* Code Snippets Column */}
              <div className="xl:col-span-6 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-100">
                  {language === 'es' ? 'Código de Solicitud y Respuesta' : 'Request & Response Code'}
                </h3>
                
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
                      onClick={() => handleCopy(codeSnippets.getPayouts[activeLang], 'get_payouts_code')}
                      className="p-1 hover:bg-[#202940] rounded text-slate-400 hover:text-white transition"
                    >
                      {copied === 'get_payouts_code' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="p-4 font-mono text-xs overflow-x-auto max-h-[300px]">
                    <pre className="text-slate-300 whitespace-pre">{codeSnippets.getPayouts[activeLang]}</pre>
                  </div>
                </div>

                {/* Response Code Block */}
                <div className="bg-[#0b0f19] rounded-2xl overflow-hidden border border-slate-800/60 shadow-xl">
                  <div className="px-4 py-2.5 bg-[#151b2d] border-b border-slate-800/80 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">RESPONSE (200 OK)</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  </div>
                  <div className="p-4 font-mono text-xs overflow-x-auto max-h-[320px]">
                    <pre className="text-emerald-400">{getPayoutsResponse}</pre>
                  </div>
                </div>
              </div>

            </div>
          </section>


          {/* Section: Webhooks & Statuses */}
          <section id="webhooks" className="scroll-mt-6 pb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-100 rounded-xl"><Webhook size={18} className="text-slate-800" /></div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {language === 'es' ? 'Webhooks y Ciclo de Vida' : 'Webhooks & Event Lifecycle'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start mt-6">
              
              <div className="text-slate-655 leading-relaxed text-xs md:text-sm space-y-4">
                <p>
                  {language === 'es'
                    ? 'Los webhooks son la estrategia recomendada para capturar eventos de pago asíncronos. Defina su endpoint receptor en la sección de Opciones de Desarrollador en Configuración.'
                    : 'Webhooks are the recommended integration strategy for capturing asynchronous payment events. Define your standard receiver endpoint within the Developer Options segment in Settings.'}
                </p>
                <p>
                  {language === 'es'
                    ? 'Una vez que una factura pasa con éxito al estado Pagada en la red blockchain, OrvixPay envía una solicitud POST segura con un cuerpo JSON a su endpoint.'
                    : 'Once an invoice successfully transitions to Paid on the blockchain network, OrvixPay sends a secure HTTP POST request with a JSON body to your endpoint.'}
                </p>
                
                {/* Event Lifecycles */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="font-bold text-slate-900 text-xs mb-2">
                    {language === 'es' ? 'Estados de Facturas Soportados' : 'Supported Invoice Statuses'}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5"><ArrowRight size={12} className="text-indigo-500" /> {language === 'es' ? 'Pendiente (Esperando pago)' : 'Pending (Waiting payment)'}</span>
                    <span className="flex items-center gap-1.5"><ArrowRight size={12} className="text-indigo-500" /> {language === 'es' ? 'Procesando (Verificando red)' : 'Confirming (Verifying on-chain)'}</span>
                    <span className="flex items-center gap-1.5"><ArrowRight size={12} className="text-indigo-500" /> {language === 'es' ? 'Pagado (Completado y exitoso)' : 'Paid (Complete & successful)'}</span>
                    <span className="flex items-center gap-1.5"><ArrowRight size={12} className="text-indigo-500" /> {language === 'es' ? 'Expirado (No pagado a tiempo)' : 'Expired (Not paid within 30 min)'}</span>
                    <span className="flex items-center gap-1.5"><ArrowRight size={12} className="text-indigo-500" /> {language === 'es' ? 'Pago Parcial (Monto incorrecto)' : 'Partially Paid (Incorrect amount)'}</span>
                    <span className="flex items-center gap-1.5"><ArrowRight size={12} className="text-indigo-500" /> {language === 'es' ? 'Cancelado (Anulado por comercio)' : 'Cancelled (Voided by merchant)'}</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/70 text-amber-800 border border-amber-100 rounded-xl text-xs">
                  <strong>{language === 'es' ? 'Consejo de Verificación:' : 'Verification Tip:'}</strong> {language === 'es' ? 'Confirme que el orderId recibido sea válido y que el amount coincida con la expectativa de su base de datos antes de liberar los servicios.' : 'Confirm the received orderId is valid and the amount matches the expectation of your database record prior to releasing services or goods.'}
                </div>
              </div>

              {/* Webhook Payload Box */}
              <div className="bg-[#0b0f19] rounded-2xl overflow-hidden border border-slate-800/60 shadow-xl">
                <div className="px-4 py-3 bg-[#151b2d] border-b border-slate-800/80 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-bold tracking-wide uppercase">
                    {language === 'es' ? 'Esquema de Webhook' : 'Webhook Payload Schema'}
                  </span>
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
