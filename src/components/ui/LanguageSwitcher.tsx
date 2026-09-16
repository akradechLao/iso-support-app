"use client";

import { useI18n } from "@/i18n/I18nContext";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
      <button
        onClick={() => setLanguage("th")}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
          language === "th"
            ? "bg-white text-blue-700 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        <Globe className="h-3.5 w-3.5" />
        TH
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
          language === "en"
            ? "bg-white text-blue-700 shadow-sm"
            : "text-slate-500 hover:text-slate-700"
        )}
      >
        <Globe className="h-3.5 w-3.5" />
        EN
      </button>
    </div>
  );
}
