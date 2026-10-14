import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { LANGUAGES, Language } from "../i18n/translations";
import { Globe, Check, ChevronDown } from "lucide-react";

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#23125E] font-bold text-xs border border-[#E2D9FF] shadow-xs hover:border-[#7C5CFC] transition-all cursor-pointer"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-[#7C5CFC]" />
        <span>🌐 {currentLang.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white shadow-xl border border-[#E2D9FF] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Select Language</span>
            <Globe className="w-3 h-3 text-[#7C5CFC]" />
          </div>

          <div className="p-1 space-y-0.5">
            {LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as Language);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#F4F0FF] text-[#7C5CFC] border border-[#E2D9FF]"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div className="text-left">
                      <span className="block font-bold">{lang.nativeName}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">{lang.label}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#7C5CFC]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
