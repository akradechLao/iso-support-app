"use client";

import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f8fc] dark:bg-slate-950">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-white dark:focus:bg-slate-800 focus:p-4 focus:text-blue-700 dark:focus:text-blue-400">Skip to content</a>
      <Sidebar />
      <div className="transition-all duration-300 lg:pl-[260px]">
        <main id="main-content" className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
