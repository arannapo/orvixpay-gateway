"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";
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
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
          light
            ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        <Globe size={13} />
        <span>{language === "en" ? "EN" : "ES"}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-28 bg-white border border-slate-200/80 rounded-xl shadow-lg z-50 py-1 overflow-hidden animate-fade-in">
          <button
            onClick={() => {
              setLanguage("en");
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-xs font-semibold transition ${
              language === "en" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-650 hover:bg-slate-50"
            }`}
          >
            English
          </button>
          <button
            onClick={() => {
              setLanguage("es");
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-xs font-semibold transition ${
              language === "es" ? "bg-slate-100 text-slate-900 font-bold" : "text-slate-650 hover:bg-slate-50"
            }`}
          >
            Español
          </button>
        </div>
      )}
    </div>
  );
}
