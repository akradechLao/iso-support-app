"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "sidebar-collapsed") {
        setCollapsed(e.newValue === "true");
      }
    };
    const onLocal = (e: Event) => {
      const detail = (e as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") setCollapsed(detail);
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("sidebar-collapsed-change", onLocal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("sidebar-collapsed-change", onLocal);
    };
  }, []);

  const handleCollapsedChange = (next: boolean) => {
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
    window.dispatchEvent(new CustomEvent("sidebar-collapsed-change", { detail: next }));
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] dark:bg-slate-950">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-white dark:focus:bg-slate-800 focus:p-4 focus:text-blue-700 dark:focus:text-blue-400">Skip to content</a>
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={handleCollapsedChange}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />
      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "lg:pl-[72px]" : "lg:pl-[260px]"
        )}
      >
        <main id="main-content" className="min-h-screen w-full">{children}</main>
      </div>
    </div>
  );
}
