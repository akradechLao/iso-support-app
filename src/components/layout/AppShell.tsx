"use client";

import Sidebar from "./Sidebar";
import ClientLanguageSwitcher from "@/components/ui/ClientLanguageSwitcher";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <Sidebar />
      <div className="fixed bottom-4 left-4 z-50 lg:left-[268px]">
        <ClientLanguageSwitcher />
      </div>
      <div className="transition-all duration-300 lg:pl-[260px]">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
