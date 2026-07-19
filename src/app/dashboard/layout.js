"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, Receipt, Key, Settings, Menu, X, FileText } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function DashboardLayout({ children }) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const { setUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [merchantId, setMerchantId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    const fetchSettings = () => {
      fetch('/api/user/settings')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setMerchantId(data.user._id || '');
            setLogoUrl(data.user.logo || '');
          }
        })
        .catch(err => console.error('Error fetching layout settings:', err));
    };

    fetchSettings();

    const handleLogoUpdate = (e) => {
      if (e.detail) {
        setLogoUrl(e.detail);
      } else {
        fetchSettings();
      }
    };

    window.addEventListener('logoUpdated', handleLogoUpdate);
    return () => window.removeEventListener('logoUpdated', handleLogoUpdate);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
      // Force redirect even if API call fails
      setUser(null);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Invoices', path: '/dashboard/invoices', icon: Receipt },
    { name: 'API Docs', path: '/dashboard/docs', icon: FileText },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="h-screen bg-[#FAFAFA] flex text-slate-900 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[270px] bg-white flex flex-col py-6 border-r border-slate-200/60 transform transition-transform duration-300 ease-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 mb-12">
          <Link href="/" className="flex items-center gap-2 pl-2 hover:opacity-80 transition-opacity">
            <img src="/logo.PNG" alt="ORVIXPAY" className="h-10 object-contain" />
          </Link>
          <button className="md:hidden text-slate-400 hover:text-slate-700 bg-white p-1 rounded-full shadow-sm border border-slate-200" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.path);
            const Icon = item.icon;
            const localizedName = item.name === 'Dashboard' ? t('navDashboard') : item.name === 'Invoices' ? t('dashInvoices') : item.name === 'API Docs' ? t('footerDocs') : item.name === 'Settings' ? t('dashSettings') : item.name;
            return (
              <Link 
                key={item.name} 
                href={item.path} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive ? 'bg-slate-900 text-white shadow-md font-semibold' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 font-medium'}`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-slate-400'} />
                {localizedName}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 mt-auto">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl font-semibold transition-colors"
          >
            <LogOut size={18} className="text-slate-400" /> {t('dashLogout')}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full bg-white">
        <header className="h-16 md:h-24 flex items-center justify-between px-6 md:px-10 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-slate-700 hover:bg-slate-100 p-2 -ml-2 rounded-lg transition" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900">
               {(() => {
                 const activeItem = navItems.find(i => (i.path === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(i.path)));
                 if (!activeItem) return t('navDashboard');
                 return activeItem.name === 'Dashboard' ? t('navDashboard') : activeItem.name === 'Invoices' ? t('dashInvoices') : activeItem.name === 'API Docs' ? t('footerDocs') : activeItem.name === 'Settings' ? t('dashSettings') : activeItem.name;
               })()}
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 relative">
            <LanguageSwitcher />
            <span className="hidden sm:block text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">{t("footerConsole")}</span>
            <div 
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold shadow-md cursor-pointer hover:bg-slate-800 transition overflow-hidden shrink-0"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <img src={logoUrl || '/logo.PNG'} alt="Logo" className="w-full h-full object-cover" />
            </div>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-3 border-b border-slate-100 mb-2">
                    <p className="text-sm font-bold text-slate-900">Merchant</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate" title={merchantId}>ID: {merchantId || 'Loading...'}</p>
                  </div>
                  <Link 
                    href="/dashboard/settings" 
                    onClick={() => setIsProfileOpen(false)} 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 font-medium transition"
                  >
                    <Settings size={16} /> Settings
                  </Link>
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }} 
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-medium transition"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>
        <div className="p-6 md:p-10 flex-1 overflow-y-auto min-w-0 bg-white">
          {children}
        </div>
      </main>
    </div>
  );
}
