"use client";

import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <Sidebar />
      <div id="lang-switcher" className="fixed bottom-4 left-4 z-50 rounded-xl bg-white px-3 py-2 shadow-lg lg:left-[268px]">
        TH / EN
      </div>
      <div className="transition-all duration-300 lg:pl-[260px]">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
