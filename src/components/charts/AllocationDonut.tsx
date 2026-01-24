'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import { CategoryData } from '@/types/portfolio';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { useVisibility } from '@/lib/visibility-context';

interface AllocationDonutProps {
  data: CategoryData[];
  totalValue: number;
}

export function AllocationDonut({ data, totalValue }: AllocationDonutProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { isVisible } = useVisibility();

  if (!data.length) {
    return (
      <div className="h-[280px] flex items-center justify-center">
        <p className="text-slate-500">Loading allocation data...</p>
      </div>
    );
  }

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const activeData = activeIndex !== null ? data[activeIndex] : null;

  return (
    <div className="relative h-[280px] animate-scale-in">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={115}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            {...({ activeIndex: activeIndex !== null ? activeIndex : undefined } as any)}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            activeShape={(props: any) => (
              <Sector
                {...props}
                outerRadius={props.outerRadius + 6}
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.4))',
                  cursor: 'pointer',
                }}
              />
            )}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                style={{
                  filter: activeIndex === null || activeIndex === index 
                    ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' 
                    : 'none',
                  opacity: activeIndex === null || activeIndex === index ? 1 : 0.4,
                  transition: 'opacity 0.2s ease, filter 0.2s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Label - Shows hovered category or total */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {activeData ? (
          <>
            <div 
              className="w-3 h-3 rounded-full mb-1"
              style={{ backgroundColor: activeData.color }}
            />
            <span className="text-2xl font-bold text-white tabular-nums">
              {formatPercentage(activeData.percentage)}
            </span>
            <span className="text-sm text-slate-300 text-center px-4 mt-1 max-w-[120px] leading-tight">
              {activeData.name}
            </span>
          </>
        ) : (
          <>
            <span className="text-sm text-slate-400 font-medium">Total Value</span>
            <span className="text-2xl font-bold text-white tabular-nums">
              {isVisible ? formatCurrency(totalValue) : '$••••••'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
