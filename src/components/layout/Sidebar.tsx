"use client";

import { useState } from "react";
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
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/I18nContext";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  GitBranch,
  FileText,
  ClipboardCheck,
  AlertTriangle,
  Scale,
  Shield,
  Bell,
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
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useI18n();

  const getLabel = (key: string) => {
    const keys = key.split(".");
    let value: unknown = t;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return (typeof value === "string" ? value : key);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl bg-slate-950 p-2 text-white shadow-lg lg:hidden"
      >
        <Menu className="h-5 w-5" />
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
          "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-slate-200 bg-white transition-all duration-300",
          collapsed ? "w-[72px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-4">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-700 to-indigo-950 text-xs font-black text-white">
            ISO
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">ISO Progress</p>
              <p className="text-[10px] text-slate-400">Command Center</p>
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
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    {Icon && <Icon className={cn("h-5 w-5 shrink-0", active ? "text-blue-600" : "text-slate-400")} />}
                    {!collapsed && <span className="truncate">{getLabel(item.label)}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Language Switcher */}
        <div className="hidden border-t border-slate-100 p-3 lg:block">
          <LanguageSwitcher />
        </div>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden border-t border-slate-100 p-3 lg:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span>{t.common.collapse}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
