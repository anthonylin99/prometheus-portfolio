import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "PathFinder ETF | Personal Portfolio Tracker",
  description: "A hypothetical ETF showcasing my personal investment thesis across Space, Crypto, Fintech, and AI sectors.",
  keywords: ["portfolio", "ETF", "investing", "crypto", "fintech", "AI", "space"],
  authors: [{ name: "PathFinder" }],
  openGraph: {
    title: "PathFinder ETF",
    description: "Personal Investment Portfolio Tracker",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gradient-radial min-h-screen antialiased noise-overlay">
        {/* Background Orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
        </div>
        
        <div className="relative flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-0 lg:ml-72 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
