"use client";

import { useI18n } from "@/i18n/I18nContext";

export default function ClientLanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
      <button
        onClick={() => setLanguage("th")}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          language === "th"
            ? "bg-white text-blue-700 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        TH
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          language === "en"
            ? "bg-white text-blue-700 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        EN
      </button>
    </div>
  );
}
