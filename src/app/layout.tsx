'use client'

import { Geist, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { BalanceDisplay } from "@/components/BalanceDisplay";
import { BalanceProvider } from "@/contexts/BalanceContext";

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ShitStake',
  description: 'ShitStake. It says it in the name.',
  icons: {
    icon: 'https://ntk8n4sii7.ufs.sh/f/cLWmiQyDE9NlgIwLQ42tHFLfQ2ob0xGRyKDipPrXh6ATZuSe',
  },
  openGraph: {
    images: 'https://ntk8n4sii7.ufs.sh/f/cLWmiQyDE9NlSCkiffdvg0uRDOQbXUdVTYkEJCo968PMcjFn',
  }, 
  twitter: {
    card: 'summary_large_image',
    title: 'ShitStake',
    description: 'ShitStake. It says it in the name.',
    images: 'https://ntk8n4sii7.ufs.sh/f/cLWmiQyDE9NlSCkiffdvg0uRDOQbXUdVTYkEJCo968PMcjFn',
  },


  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-video-preview': 1000,
  },
};

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
      <body className={`${inter.className} overflow-hidden`}>
        <BalanceProvider>
          <AppContent>{children}</AppContent>
        </BalanceProvider>\
      </body>
    </html>
  );
}
