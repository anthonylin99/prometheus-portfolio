'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Wallet, 
  FileText, 
  TrendingUp,
  Menu,
  X,
  Compass
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Holdings', href: '/holdings', icon: Wallet },
  { name: 'ETF Overview', href: '/etf', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl glass-card text-white"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen w-72 transform transition-transform duration-300 ease-out",
        "bg-[#080812]/90 backdrop-blur-xl border-r border-[rgba(139,92,246,0.15)]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo Section */}
        <div className="p-6 border-b border-[rgba(139,92,246,0.1)]">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">PathFinder</h1>
              <span className="text-xs font-medium text-violet-400 tracking-widest">ETF</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-4 mb-4">
            Navigation
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-violet-500/20 to-purple-500/10 text-white border border-violet-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-violet-400" : "text-slate-500"
                )} />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Stats Summary */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[rgba(139,92,246,0.1)]">
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Portfolio Value</p>
                <p className="text-lg font-bold text-white tabular-nums">$137,300</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                11 Holdings
              </span>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium">
                6 Categories
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
