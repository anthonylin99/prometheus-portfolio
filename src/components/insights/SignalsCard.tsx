'use client';

import { cn } from '@/lib/utils';
import type { Alert } from '@/types/insights';
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import Link from 'next/link';

interface SignalsCardProps {
  alerts: Alert[];
}

export function SignalsCard({ alerts }: SignalsCardProps) {
  if (alerts.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-[#9b8ac4]" />
          <h3 className="text-lg font-semibold text-white">Priority Alerts</h3>
        </div>
        <p className="text-slate-400 text-sm">No significant signals detected. Your portfolio is in stable condition.</p>
      </div>
    );
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'oversold':
      case 'near_support':
      case 'near_52w_low':
        return <TrendingDown className="w-4 h-4 text-emerald-400" />;
      case 'overbought':
      case 'near_resistance':
      case 'near_52w_high':
        return <TrendingUp className="w-4 h-4 text-amber-400" />;
      default:
        return <Activity className="w-4 h-4 text-[#9b8ac4]" />;
    }
  };

  const getPriorityStyles = (priority: Alert['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-500/5';
      case 'medium':
        return 'border-l-amber-500 bg-amber-500/5';
      case 'low':
        return 'border-l-slate-500 bg-slate-500/5';
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#9b8ac4]" />
          <h3 className="text-lg font-semibold text-white">Priority Alerts</h3>
        </div>
        <span className="text-xs text-slate-500">{alerts.length} signal{alerts.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-3">
        {alerts.slice(0, 5).map((alert, i) => (
          <Link
            key={`${alert.ticker}-${alert.type}-${i}`}
            href={`/holdings/${alert.ticker}`}
            className={cn(
              'block p-3 rounded-lg border-l-2 hover:bg-slate-800/30 transition-colors',
              getPriorityStyles(alert.priority)
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">{alert.ticker}</span>
                  <span className={cn(
                    'text-[10px] font-medium px-1.5 py-0.5 rounded',
                    alert.priority === 'high' && 'bg-red-500/20 text-red-400',
                    alert.priority === 'medium' && 'bg-amber-500/20 text-amber-400',
                    alert.priority === 'low' && 'bg-slate-600/50 text-slate-400'
                  )}>
                    {alert.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{alert.message}</p>
                {alert.actionHint && (
                  <p className="text-xs text-[#9b8ac4] mt-1">{alert.actionHint}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
