"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, RefreshCw } from "lucide-react";

interface TopbarProps {
  title?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, actions }: TopbarProps) {
  const pathname = usePathname();

  const segments = (pathname || "").split("/").filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { label, href, isLast: index === segments.length - 1 };
  });

  return (
    <header className="flex flex-col gap-4 border-b border-slate-100 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 pl-10 lg:pl-0">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-slate-600">
            Home
          </Link>
          {breadcrumbs.map((bc) => (
            <span key={bc.href} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3" />
              {bc.isLast ? (
                <span className="font-medium text-slate-700">{title || bc.label}</span>
              ) : (
                <Link href={bc.href} className="hover:text-slate-600">
                  {bc.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
        {title && <h1 className="mt-1 pl-10 text-xl font-bold text-slate-950 lg:pl-0">{title}</h1>}
      </div>
      <div className="flex items-center gap-2 pl-10 lg:pl-0">
        {actions}
        <button className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-700">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
