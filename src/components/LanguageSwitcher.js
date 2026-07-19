"use client";

import { useLanguage } from "@/context/LanguageContext";
import { useState, useRef, useEffect } from "react";

export default function LanguageSwitcher({ light = false }) {
  const { language, setLanguage, mounted } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
          light
            ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        <img 
          src={language === "en" ? "/flags/us.png" : "/flags/es.png"} 
          alt="" 
          className="w-4 h-4 rounded-full object-cover border border-slate-200/50 shadow-sm shrink-0" 
        />
        <span>{language === "en" ? "EN" : "ES"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200/80 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden animate-fade-in">
          <button
            onClick={() => {
              setLanguage("en");
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 text-left px-3.5 py-2.5 text-xs font-semibold transition ${
              language === "en" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-650 hover:bg-slate-50"
            }`}
          >
            <img src="/flags/us.png" alt="" className="w-4 h-4 rounded-full object-cover border border-slate-100 shadow-sm shrink-0" />
            <span>English</span>
          </button>
          <button
            onClick={() => {
              setLanguage("es");
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 text-left px-3.5 py-2.5 text-xs font-semibold transition ${
              language === "es" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-650 hover:bg-slate-50"
            }`}
          >
            <img src="/flags/es.png" alt="" className="w-4 h-4 rounded-full object-cover border border-slate-100 shadow-sm shrink-0" />
            <span>Español</span>
          </button>
        </div>
      )}
    </div>
  );
}
