"use client";

import Sidebar from "./Sidebar";
import { useI18n } from "@/i18n/I18nContext";

interface AppShellProps {
  children: React.ReactNode;
}

function LanguageSwitcherInline() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="fixed bottom-4 left-4 z-50 lg:left-[268px]">
      <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 shadow-lg">
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
    </div>
  );
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <Sidebar />
      <LanguageSwitcherInline />
      <div className="transition-all duration-300 lg:pl-[260px]">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
