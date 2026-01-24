import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  className?: string;
}

export function StatCard({ 
  label, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  className 
}: StatCardProps) {
  return (
    <div className={cn(
      "glass-card p-6 rounded-2xl animate-fade-in-up",
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-slate-400 font-medium">{label}</span>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-violet-400" />
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-white tabular-nums mb-1">
        {value}
      </p>
      {change && (
        <p className={cn(
          "text-sm font-medium",
          changeType === 'positive' && "text-emerald-400",
          changeType === 'negative' && "text-red-400",
          changeType === 'neutral' && "text-slate-400"
        )}>
          {change}
        </p>
      )}
    </div>
  );
}
