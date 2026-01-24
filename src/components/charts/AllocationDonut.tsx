'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryData } from '@/types/portfolio';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface AllocationDonutProps {
  data: CategoryData[];
  totalValue: number;
}

export function AllocationDonut({ data, totalValue }: AllocationDonutProps) {
  return (
    <div className="relative h-[320px] animate-scale-in">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                className="transition-all duration-300 hover:opacity-80"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.3))',
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-slate-400 text-sm font-medium">Total Value</span>
        <span className="text-2xl font-bold text-white tabular-nums">
          {formatCurrency(totalValue)}
        </span>
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.map((category) => (
          <div 
            key={category.name}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400 truncate">{category.name}</p>
              <p className="text-sm font-medium text-white tabular-nums">
                {formatPercentage(category.percentage)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  
  const data = payload[0].payload as CategoryData;
  
  return (
    <div className="glass-card p-3 border border-violet-500/30 shadow-xl">
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.color }}
        />
        <span className="text-sm font-medium text-white">{data.name}</span>
      </div>
      <div className="space-y-1">
        <p className="text-lg font-bold text-white tabular-nums">
          {formatCurrency(data.value)}
        </p>
        <p className="text-sm text-slate-400">
          {formatPercentage(data.percentage)} of portfolio
        </p>
        <p className="text-xs text-slate-500">
          {data.holdings.length} holding{data.holdings.length > 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
