"use client";

import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <Sidebar />
      <div className="transition-all duration-300 lg:pl-[260px]">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
