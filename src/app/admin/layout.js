"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, LayoutDashboard, Receipt, Users, Menu, X, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function AdminLayout({ children }) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout failed', error);
      setUser(null);
    }
  };

  const navItems = [
    { 
      name: 'Overview', 
      nameEs: 'Resumen',
      path: '/admin', 
      icon: LayoutDashboard 
    },
    { 
      name: 'Merchants', 
      nameEs: 'Comercios',
      path: '/admin/merchants', 
      icon: Users 
    },
    { 
      name: 'All Invoices', 
      nameEs: 'Todas las Facturas',
      path: '/admin/invoices', 
      icon: Receipt 
    },
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
      <aside className={`fixed inset-y-0 left-0 z-50 w-[270px] bg-slate-950 text-white flex flex-col py-6 border-r border-slate-900 transform transition-transform duration-300 ease-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 mb-12">
          <Link href="/" className="flex items-center gap-2 pl-2 hover:opacity-80 transition-opacity">
            <img src="/logo.PNG" alt="ORVIXPAY" className="h-10 object-contain invert brightness-0" />
            <span className="text-[10px] font-bold tracking-widest text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full uppercase bg-purple-950/20">Admin</span>
          </Link>
          <button className="md:hidden text-slate-400 hover:text-slate-200 bg-slate-900 p-1 rounded-full shadow-sm" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.path === '/admin' ? pathname === '/admin' : pathname.startsWith(item.path);
            const Icon = item.icon;
            const localizedName = language === 'es' ? item.nameEs : item.name;
            return (
              <Link 
                key={item.name} 
                href={item.path} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${isActive ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30 font-semibold' : 'text-slate-400 hover:bg-slate-900 hover:text-white font-medium'}`}
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
            className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl font-semibold transition-colors"
          >
            <LogOut size={18} className="text-slate-500" /> {language === 'es' ? 'Cerrar Sesión' : 'Logout'}
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
                 const activeItem = navItems.find(i => (i.path === '/admin' ? pathname === '/admin' : pathname.startsWith(i.path)));
                 if (!activeItem) return language === 'es' ? 'Panel de Control' : 'Dashboard';
                 return language === 'es' ? activeItem.nameEs : activeItem.name;
               })()}
            </h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 relative">
            <LanguageSwitcher />
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1.5 rounded-full uppercase tracking-wider">
              <ShieldAlert size={14} />
              System Admin
            </span>
            <div className="relative group">
              <div 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold shadow-md cursor-pointer hover:bg-purple-700 transition overflow-hidden shrink-0 border border-purple-200"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="text-sm">AD</div>
              </div>
              <div className="absolute right-0 top-full mt-2 hidden group-hover:block bg-purple-600 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-xl whitespace-nowrap z-50 pointer-events-none font-medium">
                {language === 'es' ? 'Menú de Perfil' : 'Profile Menu'}
              </div>
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
                    <p className="text-sm font-bold text-slate-900">System Admin</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{user?.email}</p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }} 
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl font-medium transition mx-2"
                  >
                    <LogOut size={16} /> {language === 'es' ? 'Cerrar Sesión' : 'Logout'}
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
