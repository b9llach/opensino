'use client'

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { BalanceDisplay } from "@/components/BalanceDisplay";
import { BalanceProvider } from "@/contexts/BalanceContext";

const geist = Geist({
  subsets: ["latin"],
});

function AppContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <div className="fixed inset-y-0 w-64">
        <Navbar />
      </div>
      <div className="flex-1 ml-64">
        <div className="sticky top-0 h-16 border-b border-[#243441] bg-[#0F1923] flex items-center justify-center px-6 z-10">
          <BalanceDisplay />
        </div>
        <main className="p-6 overflow-y-auto h-[calc(100vh-4rem)] bg-[#0F1923]">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} overflow-hidden`}>
        <BalanceProvider>
          <AppContent>{children}</AppContent>
        </BalanceProvider>
      </body>
    </html>
  );
}
