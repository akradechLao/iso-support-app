"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  Scale,
  Shield,
  Bell,
  GraduationCap,
  ChevronLeft,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { actionRepo } from "@/data/repositories";
import { useI18n } from "@/i18n/I18nContext";
import { useDarkMode } from "@/contexts/DarkModeContext";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  GitBranch,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  Scale,
  Shield,
  Bell,
  GraduationCap,
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "nav.dashboard", icon: "LayoutDashboard" },
  { href: "/iso-progress", label: "nav.isoProgress", icon: "GitBranch" },
  { href: "/documents", label: "nav.documents", icon: "FileText" },
  { href: "/audits", label: "nav.audits", icon: "ClipboardCheck" },
  { href: "/ncr-car", label: "nav.ncrCar", icon: "AlertTriangle" },
  { href: "/legal-compliance", label: "nav.legal", icon: "Scale" },
  { href: "/risks", label: "nav.risks", icon: "Shield" },
  { href: "/alerts", label: "nav.alerts", icon: "Bell" },
  { href: "/training", label: "nav.training", icon: "GraduationCap" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar-collapsed") === "true";
    }
    return false;
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overdueCount, setOverdueCount] = useState(0);
  const { t, language, setLanguage } = useI18n();
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    try {
      const actions = actionRepo.findAll({ status: "all", standard: "all", department: "all", period: "all" });
      setOverdueCount(actions.filter((a) => a.status === "overdue").length);
    } catch {
      // ignore
    }
  }, []);

  const getLabel = (key: string) => {
    const keys = key.split(".");
    let value: unknown = t;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return (typeof value === "string" ? value : key);
  };

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-slate-950 p-2 text-white shadow-lg lg:hidden"
        aria-label="Menu"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 dark:border-slate-700 px-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-700 to-indigo-950 text-xs font-black text-white">
            ISO
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{t.logo.title}</p>
              <p className="text-[10px] text-slate-400">{t.logo.subtitle}</p>
            </div>
          )}
          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-1 text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = ICONS[item.icon];
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {Icon && <Icon className={cn("h-5 w-5 shrink-0", active ? "text-blue-600" : "text-slate-400")} />}
                    {!collapsed && <span className="truncate">{getLabel(item.label)}</span>}
                    {!collapsed && item.href === "/alerts" && overdueCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                        {overdueCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer area */}
        <div className="border-t border-slate-100 dark:border-slate-700 p-3">
          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => {
              const next = !collapsed;
              setCollapsed(next);
              localStorage.setItem("sidebar-collapsed", String(next));
            }}
            className="hidden w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 lg:flex"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span>{t.common.collapse}</span>}
          </button>
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="mb-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          {/* Language Switcher */}
          <div className="mt-2 flex items-center justify-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setLanguage("th")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                language === "th"
                  ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              TH
            </button>
            <button
              onClick={() => setLanguage("en")}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                language === "en"
                  ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-400 shadow-sm"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
              EN
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
