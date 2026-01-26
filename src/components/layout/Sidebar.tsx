'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Wallet,
  FileText,
  Compass,
  Menu,
  X,
  Users,
  LogIn,
  LogOut,
} from 'lucide-react';
import { cn, formatCurrency, formatPercentagePrecise } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface SidebarData {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  holdingsCount: number;
  etfPrice: number;
  etfChange: number;
  etfChangePercent: number;
  etfTicker?: string;
}

const publicNav = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Holdings', href: '/holdings', icon: Wallet },
  { name: 'Explore', href: '/explore', icon: Compass },
  { name: 'ETF Overview', href: '/etf', icon: FileText },
];

const authNav = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Holdings', href: '/holdings', icon: Wallet },
  { name: 'Explore', href: '/explore', icon: Compass },
  { name: 'Circle', href: '/circle', icon: Users },
  { name: 'ETF Overview', href: '/etf', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<SidebarData | null>(null);

  const navigation = isAuthenticated ? authNav : publicNav;

  useEffect(() => {
    async function fetchData() {
      try {
        if (isAuthenticated) {
          // Fetch user's portfolio data
          const res = await fetch('/api/user/portfolio');
          if (res.ok) {
            const portfolio = await res.json();
            setData({
              totalValue: portfolio.summary?.totalValue || 0,
              dayChange: portfolio.summary?.dayChange || 0,
              dayChangePercent: portfolio.summary?.dayChangePercent || 0,
              holdingsCount: portfolio.holdings?.length || 0,
              etfPrice: 0,
              etfChange: 0,
              etfChangePercent: 0,
              etfTicker: undefined,
            });

            // Also fetch user profile for ETF ticker
            const profileRes = await fetch('/api/user/profile');
            if (profileRes.ok) {
              const profile = await profileRes.json();
              setData((prev) =>
                prev
                  ? { ...prev, etfTicker: profile.etfTicker }
                  : prev
              );
            }
          }
        } else {
          // Fetch public $ALIN data
          const [pricesRes, etfRes] = await Promise.all([
            fetch('/api/prices'),
            fetch('/api/etf'),
          ]);

          const prices = await pricesRes.json();
          const etf = await etfRes.json();

          setData({
            totalValue: prices.summary?.totalValue || 0,
            dayChange: prices.summary?.dayChange || 0,
            dayChangePercent: prices.summary?.dayChangePercent || 0,
            holdingsCount: prices.holdings?.length || 0,
            etfPrice: etf.currentPrice || 100,
            etfChange: etf.dayChange || 0,
            etfChangePercent: etf.dayChangePercent || 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch sidebar data:', error);
      }
    }

    fetchData();
  }, [isAuthenticated]);

  const isPositive = (data?.dayChangePercent || 0) >= 0;

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
        "fixed top-0 left-0 z-40 h-screen w-56 transform transition-transform duration-300 ease-out",
        "bg-[#080812]/90 backdrop-blur-xl border-r border-[rgba(139,92,246,0.15)]",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo Section */}
        <div className="p-4 border-b border-[rgba(139,92,246,0.1)]">
          <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
            <div className="relative">
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow">
                <Image
                  src="/prometheus.png"
                  alt="Prometheus ETF"
                  width={44}
                  height={44}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Prometheus</h1>
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
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
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
        <div className="absolute bottom-8 left-0 right-0 p-4 border-t border-[rgba(139,92,246,0.1)]">
          {/* Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 mb-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 mb-3 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 hover:text-white transition-colors text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
          )}

          {/* ETF Price (show public $ALIN for unauthenticated, or user's ticker) */}
          {!isAuthenticated && data && (
            <div className="glass-card p-3 rounded-xl mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-400">$ALIN</span>
              </div>
              <p className="text-xl font-bold text-white tabular-nums">
                ${data.etfPrice.toFixed(2)}
              </p>
              <p className={cn(
                "text-xs font-medium mt-1 tabular-nums",
                data.etfChangePercent >= 0 ? "text-emerald-400" : "text-red-400"
              )}>
                {formatPercentagePrecise(data.etfChangePercent)} ({data.etfChange >= 0 ? '+' : ''}${Math.abs(data.etfChange).toFixed(2)})
              </p>
            </div>
          )}

          {/* Portfolio Summary */}
          <div className="glass-card p-3 rounded-xl">
            <div className="flex items-center gap-3">
              {isAuthenticated && session?.user ? (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border-2 border-violet-500/30"
                  style={{ backgroundColor: '#8b5cf6' }}
                >
                  {(session.user.name || session.user.email || '?').charAt(0).toUpperCase()}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-violet-500/30 flex-shrink-0">
                  <Image
                    src="/profile.png"
                    alt="Profile"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">
                  {isAuthenticated
                    ? data?.etfTicker
                      ? `$${data.etfTicker}`
                      : 'Portfolio Value'
                    : 'Portfolio Value'}
                </p>
                <p className="text-base font-bold text-white tabular-nums">
                  {data ? formatCurrency(data.totalValue) : '—'}
                </p>
                {data && (
                  <p className={cn(
                    "text-xs font-medium mt-0.5 tabular-nums",
                    isPositive ? "text-emerald-400" : "text-red-400"
                  )}>
                    {formatPercentagePrecise(data.dayChangePercent)} ({data.dayChange >= 0 ? '+' : ''}{formatCurrency(data.dayChange)})
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
