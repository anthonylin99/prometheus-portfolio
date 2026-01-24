'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Holding, categoryColors } from '@/types/portfolio';
import { formatCurrency, formatCompactNumber, getLogoUrl } from '@/lib/utils';
import { CompanyLogo } from '@/components/ui/CompanyLogo';

interface HoldingsBarProps {
  holdings: Holding[];
}

export function HoldingsBar({ holdings }: HoldingsBarProps) {
  const sortedHoldings = [...holdings].sort((a, b) => b.value - a.value);
  
  return (
    <div className="space-y-3 animate-fade-in-up">
      {sortedHoldings.map((holding, index) => {
        const maxValue = sortedHoldings[0].value;
        const percentage = (holding.value / maxValue) * 100;
        const color = categoryColors[holding.category];
        
        return (
          <div 
            key={holding.ticker}
            className="group relative"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3 mb-1.5">
              <CompanyLogo ticker={holding.ticker} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{holding.ticker}</span>
                    <span className="text-sm text-slate-500 hidden sm:inline truncate">
                      {holding.name}
                    </span>
                  </div>
                  <span className="font-bold text-white tabular-nums ml-2">
                    {formatCurrency(holding.value)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ 
                  width: `${percentage}%`,
                  background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                  boxShadow: `0 0 12px ${color}40`,
                }}
              />
            </div>
            
            {/* Hover tooltip */}
            <div className="absolute right-0 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
              <div className="glass-card p-2 text-xs text-slate-400 whitespace-nowrap">
                {holding.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Alternative: Recharts Bar Chart version
export function HoldingsBarChart({ holdings }: HoldingsBarProps) {
  const sortedHoldings = [...holdings]
    .sort((a, b) => b.value - a.value)
    .map(h => ({
      ...h,
      fill: categoryColors[h.category],
    }));

  return (
    <div className="h-[400px] animate-scale-in">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedHoldings}
          layout="vertical"
          margin={{ top: 0, right: 0, bottom: 0, left: 60 }}
        >
          <XAxis 
            type="number" 
            tickFormatter={(value) => formatCompactNumber(value)}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis 
            type="category" 
            dataKey="ticker"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#fff', fontSize: 13, fontWeight: 500 }}
            width={50}
          />
          <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
          <Bar 
            dataKey="value" 
            radius={[0, 6, 6, 0]}
            maxBarSize={24}
          >
            {sortedHoldings.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill}
                className="transition-opacity hover:opacity-80"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomBarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload as Holding & { fill: string };
  
  return (
    <div className="glass-card p-3 border border-violet-500/30 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <CompanyLogo ticker={data.ticker} size="sm" />
        <div>
          <span className="font-semibold text-white">{data.ticker}</span>
          <span className="text-sm text-slate-400 ml-2">{data.name}</span>
        </div>
      </div>
      <p className="text-lg font-bold text-white tabular-nums mb-1">
        {formatCurrency(data.value)}
      </p>
      <p className="text-xs text-slate-400">{data.description}</p>
      <div 
        className="mt-2 px-2 py-0.5 rounded-full text-xs inline-block"
        style={{ backgroundColor: `${data.fill}20`, color: data.fill }}
      >
        {data.category}
      </div>
    </div>
  );
}
