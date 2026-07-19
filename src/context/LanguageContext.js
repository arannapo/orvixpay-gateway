"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('language');
    if (savedLang === 'en' || savedLang === 'es') {
      setLanguage(savedLang);
    }
    setMounted(true);
  }, []);

  const changeLanguage = (lang) => {
    if (lang === 'en' || lang === 'es') {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    }
  };

  const t = (key) => {
    const dict = translations[language] || translations['en'];
    return dict[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
