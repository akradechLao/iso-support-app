import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { FilterProvider } from "@/hooks/useFilters";
import { I18nProvider } from "@/i18n/I18nContext";
import { DarkModeProvider } from "@/contexts/DarkModeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ISO Progress Tracking Systems",
  description: "ISO management, compliance and corrective action tracking",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${geistSans.variable} ${geistMono.variable} h-full`} suppressHydrationWarning>
      <body className="min-h-full antialiased" style={{ fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif" }}>
        <I18nProvider>
          <DarkModeProvider>
            <FilterProvider>
              <AppShell>{children}</AppShell>
            </FilterProvider>
          </DarkModeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
