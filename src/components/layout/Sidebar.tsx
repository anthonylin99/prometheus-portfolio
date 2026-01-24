'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Wallet, 
  FileText, 
  TrendingUp,
  TrendingDown,
  Menu,
  X,
  Settings,
  Eye,
  Lock
} from 'lucide-react';
import { cn, formatCurrency, formatPercentagePrecise } from '@/lib/utils';
import { useVisibility } from '@/lib/visibility-context';
import { PINModal } from '@/components/ui/PINModal';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Holdings', href: '/holdings', icon: Wallet },
  { name: 'ETF Overview', href: '/etf', icon: FileText },
  { name: 'Admin', href: '/admin', icon: Settings },
];

interface SidebarData {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  holdingsCount: number;
  etfPrice: number;
  etfChange: number;
  etfChangePercent: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<SidebarData | null>(null);
  const { 
    isVisible, 
    isPINModalOpen, 
    openPINModal, 
    closePINModal, 
    unlockWithPIN, 
    hideValues,
    correctPIN 
  } = useVisibility();

  const handleVisibilityToggle = () => {
    if (isVisible) {
      // If visible, just hide (no PIN needed)
      hideValues();
    } else {
      // If hidden, require PIN to show
      openPINModal();
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
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
      } catch (error) {
        console.error('Failed to fetch sidebar data:', error);
      }
    }
    
    fetchData();
  }, []);

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
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
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
        <div className="absolute bottom-8 left-0 right-0 p-4 border-t border-[rgba(139,92,246,0.1)]">
          {/* Visibility Toggle */}
          <button
            onClick={handleVisibilityToggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 mb-3 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-slate-400 hover:text-white transition-colors text-sm"
            title={isVisible ? 'Hide amounts' : 'Enter PIN to show amounts'}
          >
            {isVisible ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{isVisible ? 'Hide Values' : 'Enter PIN'}</span>
          </button>

          {/* $ALIN Price */}
          <div className="glass-card p-3 rounded-xl mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-400">$ALIN</span>
            </div>
            <p className="text-xl font-bold text-white tabular-nums">
              {isVisible ? `$${data?.etfPrice.toFixed(2) || '100.00'}` : '$••••••'}
            </p>
            {data && (
              <p className={cn(
                "text-xs font-medium mt-1 tabular-nums",
                data.etfChangePercent >= 0 ? "text-emerald-400" : "text-red-400"
              )}>
                {formatPercentagePrecise(data.etfChangePercent)} ({isVisible ? `${data.etfChange >= 0 ? '+' : ''}$${Math.abs(data.etfChange).toFixed(2)}` : '$••••'})
              </p>
            )}
          </div>

          {/* Portfolio Summary */}
          <div className="glass-card p-3 rounded-xl">
            <div className="flex items-center gap-3">
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
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400">Portfolio Value</p>
                <p className="text-base font-bold text-white tabular-nums">
                  {data ? (isVisible ? formatCurrency(data.totalValue) : '$••••••') : '—'}
                </p>
                {data && (
                  <p className={cn(
                    "text-xs font-medium mt-0.5 tabular-nums",
                    isPositive ? "text-emerald-400" : "text-red-400"
                  )}>
                    {formatPercentagePrecise(data.dayChangePercent)} ({isVisible ? `${data.dayChange >= 0 ? '+' : ''}${formatCurrency(data.dayChange)}` : '$••••'})
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* PIN Modal */}
      <PINModal
        isOpen={isPINModalOpen}
        onClose={closePINModal}
        onSuccess={unlockWithPIN}
        correctPIN={correctPIN}
      />
    </>
  );
}
