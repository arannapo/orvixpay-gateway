"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Terminal, 
  Wallet, 
  Coins, 
  Activity, 
  ArrowUpRight,
  Link2
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Home() {
  const { t, language } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLang, setActiveLang] = useState("curl");
  const [currentLogs, setCurrentLogs] = useState([]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const logs = [
      { color: "text-emerald-600", event: t("mockPaid"), detail: "Order #8392 — 100.00 USDT" },
      { color: "text-amber-600", event: t("mockPartial"), detail: "Order #8391 — 40.00 / 100 USDT" },
      { color: "text-purple-600", event: t("mockRefunded"), detail: t("mockReturned") },
      { color: "text-indigo-600", event: t("mockGas"), detail: t("mockGasDetail") }
    ];

    let timer;
    let index = 0;

    const runSimulation = () => {
      setCurrentLogs([]);
      index = 0;

      const addLog = () => {
        if (index < logs.length && logs[index]) {
          const nextLog = logs[index];
          setCurrentLogs((prev) => [...prev.filter(Boolean), nextLog]);
          index++;
          timer = setTimeout(addLog, 1600);
        } else {
          // Pause for 2.5 seconds before restarting
          timer = setTimeout(runSimulation, 2500);
        }
      };

      addLog();
    };

    runSimulation();
    return () => clearTimeout(timer);
  }, [language]);
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-850 font-sans selection:bg-purple-100 selection:text-purple-900 relative">
      
      {/* Background Mesh Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-100/50 blur-[130px]" />
        <div className="absolute top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-100/40 blur-[150px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-fuchsia-100/40 blur-[130px]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MCAwIEwgMCAwIDAgNDApIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMCwwLDAsMC4wMikiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4n)] opacity-85"></div>
      </div>

      <header className={`sticky z-50 bg-white/80 backdrop-blur-md transition-all duration-300 ${
        isScrolled 
          ? "top-0 w-full border-b border-slate-200/40 rounded-none shadow-sm" 
          : "top-4 mx-4 max-w-6xl md:mx-auto border border-slate-200/50 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.02)]"
      }`}>
        <div className={`transition-all duration-300 ${isScrolled ? "max-w-7xl mx-auto px-6 py-3" : "px-6 py-3.5"} flex justify-between items-center`}>
          <div className="flex items-center gap-3">
            <img src="/logo.PNG" alt="ORVIXPAY" className="h-8 object-contain" />
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            <a href="#features" className="hover:text-slate-900 transition-colors duration-200">{t("navFeatures")}</a>
            <a href="#developers" className="hover:text-slate-900 transition-colors duration-200">{t("navDevelopers")}</a>
            <a href="#security" className="hover:text-slate-900 transition-colors duration-200">{t("navSecurity")}</a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <LanguageSwitcher />
            <Link href="/login" className="hidden sm:inline-block px-3 py-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors duration-200">
              {t("navLogin")}
            </Link>
            <Link href="/register" className="px-4 sm:px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-xs sm:text-sm font-bold text-white rounded-xl shadow-md shadow-slate-900/5 hover:shadow-slate-900/10 transition-all duration-300">
              {t("navGetStarted")}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-full text-xs font-bold text-purple-750 mb-6 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
            <span>BEP20 Auto-Sweep Gateway Live</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight md:leading-[1.1]">
            {t("heroTitle")} <br />
            <span className="bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">
              {t("heroSubtitle")}
            </span>
          </h1>

          <p className="mt-6 text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            {t("heroDescription")}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-extrabold rounded-xl hover:bg-slate-800 transition shadow-lg flex items-center justify-center gap-2 group text-sm">
              <span>{t("heroSandbox")}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm text-slate-700 hover:text-slate-950">
              <span>{t("heroDevPortal")}</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Premium UI Mockup Showcase */}
          <div className="mt-20 max-w-5xl mx-auto relative rounded-[2rem] p-[1px] bg-gradient-to-br from-slate-200 to-transparent shadow-[0_15px_50px_-15px_rgba(124,58,237,0.08)]">
            <div className="absolute inset-0 bg-white/70 rounded-[2.5rem] -z-10" />
            <div className="bg-white rounded-[1.95rem] overflow-hidden border border-slate-200/80 p-4 md:p-8 flex flex-col lg:flex-row gap-8 items-stretch">
              
              {/* Left Side: Mock Dashboard Audit */}
              <div className="flex-1 bg-slate-50/50 border border-slate-200/60 rounded-2xl p-6 text-left flex flex-col justify-between shadow-inner">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-550">{t("mockDashboardTitle")}</h3>
                    <div className="flex gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-100 flex items-center justify-center"><span className="w-1 h-1 bg-slate-400 rounded-full"></span></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-100 flex items-center justify-center"><span className="w-1 h-1 bg-slate-400 rounded-full"></span></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-100 flex items-center justify-center"><span className="w-1 h-1 bg-slate-400 rounded-full"></span></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white border border-slate-200/70 p-4 rounded-xl shadow-sm">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{t("mockRevenue")}</span>
                      <strong className="text-xl font-bold text-slate-800">$45,290.00</strong>
                    </div>
                    <div className="bg-white border border-slate-200/70 p-4 rounded-xl shadow-sm">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{t("mockSuccessRate")}</span>
                      <strong className="text-xl font-bold text-emerald-600">99.8%</strong>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="block text-[10px] text-slate-555 font-bold uppercase tracking-wider">{t("mockActivityLog")}</span>
                    <div className="space-y-2.5 font-mono text-[11px] text-slate-650 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm min-h-[135px] flex flex-col justify-start">
                      {currentLogs.map((log, i) => {
                        if (!log) return null;
                        return (
                          <div key={i} className="flex justify-between items-center animate-fade-in transition-all duration-300">
                            <span className={`${log.color || 'text-slate-500'} font-bold`}>{log.event}</span>
                            <span className="text-[10px] text-slate-500 font-medium">{log.detail}</span>
                          </div>
                        );
                      })}
                      {currentLogs.length < 4 && (
                        <div className="flex items-center gap-1 font-mono text-purple-650 text-[10px] font-bold">
                          <span>&gt;</span>
                          <span className="w-1.5 h-3 bg-purple-500 animate-pulse"></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex justify-between items-center text-xs text-slate-450 font-semibold">
                  <span>API Status: Operational</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live network node</span>
                </div>
              </div>

              {/* Right Side: Mock Invoice Checkout Checkout */}
              <div className="w-full lg:w-[320px] bg-white rounded-2xl p-6 text-left border border-slate-200 text-slate-850 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.04)] relative">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-extrabold text-sm">O</div>
                      <span className="font-bold text-xs text-slate-900">{t("mockCheckoutTitle")}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200/50 rounded-full font-bold text-[9px] uppercase tracking-wider">{t("dashStatusPartial")}</span>
                  </div>

                  <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl mb-4">
                    <span className="block text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-1">{t("mockRemaining")}</span>
                    <div className="flex items-baseline justify-between gap-2 mt-1">
                      <strong className="text-2xl font-black tracking-tight text-amber-800">60.00</strong>
                      <div className="flex items-center gap-1 bg-white border border-amber-200/50 px-2 py-0.5 rounded-lg shadow-sm">
                        <img src="/coins/usdt.png" alt="" className="w-4 h-4 object-contain" />
                        <span className="text-xs font-bold text-amber-700">USDT</span>
                      </div>
                    </div>
                    <p className="text-[9.5px] text-slate-500 font-bold mt-2">{t("mockReceived")}</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block mb-1">{t("mockPaymentAddress")}</span>
                      <div className="bg-slate-50 border border-slate-200/60 p-2.5 rounded-lg text-[10px] font-mono truncate text-slate-600 select-all">
                        0x752A180d...55d398
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-550">
                    <Activity size={14} className="animate-pulse text-purple-600" />
                    <span>{t("mockMonitoring")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="bg-white border-y border-slate-200/60 py-10 relative">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <strong className="block text-3xl font-black text-slate-900 mb-1">0%</strong>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("statsFees")}</span>
            </div>
            <div>
              <strong className="block text-3xl font-black text-slate-900 mb-1">&lt; 3s</strong>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("statsSpeed")}</span>
            </div>
            <div>
              <strong className="block text-3xl font-black text-slate-900 mb-1">100%</strong>
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t("statsSweeps")}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <img src="/coins/usdt.png" alt="" className="w-8 h-8 object-contain shadow-sm" />
                <img src="/coins/usdc.png" alt="" className="w-8 h-8 object-contain shadow-sm" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">{t("featTitle")}</h2>
            <p className="text-slate-600 mt-4 leading-relaxed font-medium">
              {t("featDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-8 hover:border-purple-500/35 transition duration-300 space-y-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-650 rounded-xl flex items-center justify-center shadow-sm">
                <Wallet size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t("featSweepTitle")}</h3>
              <p className="text-sm text-slate-655 leading-relaxed font-medium">
                {t("featSweepDesc")}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-8 hover:border-indigo-500/35 transition duration-300 space-y-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-650 rounded-xl flex items-center justify-center shadow-sm">
                <ShieldCheck size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t("featRefundTitle")}</h3>
              <p className="text-sm text-slate-655 leading-relaxed font-medium">
                {t("featRefundDesc")}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-8 hover:border-pink-500/35 transition duration-300 space-y-4">
              <div className="w-12 h-12 bg-pink-50 text-pink-655 rounded-xl flex items-center justify-center shadow-sm">
                <Zap size={22} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t("featStatusTitle")}</h3>
              <p className="text-sm text-slate-655 leading-relaxed font-medium">
                {t("featStatusDesc")}
              </p>
            </div>

            {/* Feature 4: No KYC */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-8 hover:border-emerald-500/35 transition duration-300 space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-650 rounded-xl flex items-center justify-center shadow-sm">
                <ShieldCheck size={22} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t("featKycTitle")}</h3>
              <p className="text-sm text-slate-655 leading-relaxed font-medium">
                {t("featKycDesc")}
              </p>
            </div>

            {/* Feature 5: Business Logo Customization */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-8 hover:border-amber-500/35 transition duration-300 space-y-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-650 rounded-xl flex items-center justify-center shadow-sm">
                <Cpu size={22} className="text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t("featBrandTitle")}</h3>
              <p className="text-sm text-slate-655 leading-relaxed font-medium">
                {t("featBrandDesc")}
              </p>
            </div>

            {/* Feature 6: Success & Cancel Redirect URLs */}
            <div className="bg-white border border-slate-200/80 shadow-sm rounded-2xl p-8 hover:border-blue-500/35 transition duration-300 space-y-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-650 rounded-xl flex items-center justify-center shadow-sm">
                <Link2 size={22} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{t("featRedirectTitle")}</h3>
              <p className="text-sm text-slate-655 leading-relaxed font-medium">
                {t("featRedirectDesc")}
              </p>
            </div>
          </div>
        </section>

        {/* Developer Sandbox / Terminal */}
        <section id="developers" className="bg-white border-y border-slate-200/60 py-24 md:py-32">
          <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold rounded-full">
                <Terminal size={12} />
                <span>{t("navDevelopers")}</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {t("playTitle")}
              </h2>
              <p className="text-slate-650 text-base leading-relaxed font-medium">
                {t("playDesc")}
              </p>
              <div className="space-y-3 font-bold text-slate-700 text-sm">
                <p className="flex items-center gap-2 text-emerald-600">{t("playBullet1")}</p>
                <p className="flex items-center gap-2 text-emerald-600">{t("playBullet2")}</p>
                <p className="flex items-center gap-2 text-emerald-600">{t("playBullet3")}</p>
              </div>
            </div>

            {/* Code Playground Box */}
            <div className="flex-1 w-full bg-[#030610] border border-slate-800 rounded-2xl p-4 md:p-6 text-left font-mono text-[11px] md:text-xs overflow-hidden shadow-2xl relative">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/[0.05] pb-4 mb-4 gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/40"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500/40"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500/40"></span>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-1.5 bg-white/[0.03] p-1 rounded-lg border border-white/[0.05]">
                  {[
                    { id: "curl", label: "cURL" },
                    { id: "node", label: "NodeJS" },
                    { id: "python", label: "Python" },
                    { id: "php", label: "PHP" }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setActiveLang(lang.id)}
                      className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase transition ${
                        activeLang === lang.id 
                          ? "bg-white/[0.08] text-white shadow-sm" 
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {activeLang === "curl" && (
                  <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {`curl -X POST https://orvixpay.com/api/invoice/create \\
  -H "X-API-Key: orvix_live_83749a239b..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 100.00,
    "currency": "USD",
    "coin": "USDT",
    "orderId": "ORD_9381023",
    "customerEmail": "customer@example.com"
  }'`}
                  </pre>
                )}

                {activeLang === "node" && (
                  <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {`const response = await fetch('https://orvixpay.com/api/invoice/create', {
  method: 'POST',
  headers: {
    'X-API-Key': 'orvix_live_83749a239b...',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 100.00,
    currency: 'USD',
    coin: 'USDT',
    orderId: 'ORD_9381023',
    customerEmail: 'customer@example.com'
  })
});
const data = await response.json();`}
                  </pre>
                )}

                {activeLang === "python" && (
                  <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {`import requests

url = "https://orvixpay.com/api/invoice/create"
headers = {
    "X-API-Key": "orvix_live_83749a239b...",
    "Content-Type": "application/json"
}
payload = {
    "amount": 100.00,
    "currency": "USD",
    "coin": "USDT",
    "orderId": "ORD_9381023",
    "customerEmail": "customer@example.com"
}

response = requests.post(url, json=payload, headers=headers)
data = response.json()`}
                  </pre>
                )}

                {activeLang === "php" && (
                  <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {`<?php
$ch = curl_init("https://orvixpay.com/api/invoice/create");
$payload = json_encode([
    "amount" => 100.00,
    "currency" => "USD",
    "coin" => "USDT",
    "orderId" => "ORD_9381023",
    "customerEmail" => "customer@example.com"
]);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "X-API-Key: orvix_live_83749a239b...",
    "Content-Type: application/json"
]);

$response = curl_exec($ch);
$data = json_decode($response, true);`}
                  </pre>
                )}

                <div className="border-t border-white/[0.04] pt-4">
                  <span className="block text-[9px] uppercase font-bold text-slate-500 tracking-wider mb-2">JSON Payout Response</span>
                  <pre className="text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {`{
  "success": true,
  "invoiceId": "6a5cd50657b0e...",
  "paymentAddress": "0xdd9ea8a577210e2a4bedb7427716eb5036814040",
  "coin": "USDT",
  "amount": 100.00,
  "paymentUrl": "https://orvixpay.com/invoice/6a5cd50657b0e..."
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="max-w-4xl mx-auto px-6 py-24 md:py-32 text-center">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-slate-200/80 rounded-[2.5rem] p-8 md:p-16 space-y-6 relative overflow-hidden shadow-md">
            <div className="absolute inset-0 z-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSg0MCAwIEwgMCAwIDAgNDApIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMCwwLDAsMC4wMSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4n)] opacity-30"></div>
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900">{t("ctaTitle")}</h2>
              <p className="text-slate-650 text-sm md:text-base max-w-lg mx-auto leading-relaxed font-medium">
                {t("ctaDesc")}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register" className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition shadow-lg text-sm flex items-center justify-center gap-1.5">
                  {t("ctaCreate")} <ArrowRight size={16} />
                </Link>
                <Link href="/login" className="px-8 py-4 bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 rounded-xl transition text-sm flex items-center justify-center">
                  {t("ctaLogin")}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200 bg-white/50 backdrop-blur-md pt-16 pb-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <img src="/logo.PNG" alt="ORVIXPAY" className="h-8 object-contain" />
            <p className="text-slate-500 text-xs leading-relaxed font-semibold">
              {t("footerDesc")}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{t("footerStatus")}</span>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">{t("footerProduct")}</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-500">
              <li><Link href="/login" className="hover:text-slate-900 transition-colors">{t("footerConsole")}</Link></li>
              <li><Link href="/register" className="hover:text-slate-900 transition-colors">{t("footerSandbox")}</Link></li>
              <li><a href="#features" className="hover:text-slate-900 transition-colors">{t("navFeatures")}</a></li>
              <li><a href="#developers" className="hover:text-slate-900 transition-colors">{t("footerDocs")}</a></li>
            </ul>
          </div>

          {/* Column 3: Developers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">{t("navDevelopers")}</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-500">
              <li><a href="#developers" className="hover:text-slate-900 transition-colors">{t("playBullet3")}</a></li>
              <li><a href="#developers" className="hover:text-slate-900 transition-colors">{t("footerDocs")}</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">{t("footerStatus")}</a></li>
            </ul>
          </div>

          {/* Column 4: Legal & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">{t("footerLegal")}</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-500">
              <li><a href="#" className="hover:text-slate-900 transition-colors">{t("footerTerms")}</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">{t("footerPrivacy")}</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">{t("footerSupport")}</a></li>
              <li><a href="#" className="hover:text-slate-900 transition-colors">{t("footerRules")}</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-200/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold text-slate-400">
          <span>&copy; {new Date().getFullYear()} OrvixPay. All rights reserved.</span>
          <span className="flex items-center gap-1 font-bold text-[10px] text-slate-400 uppercase tracking-wider">
            {t("footerProtected")}
          </span>
        </div>
      </footer>

    </div>
  );
}
