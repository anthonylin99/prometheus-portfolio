'use client';

import { BentoGrid, BentoCard } from '@/components/layout/BentoGrid';
import { SkeletonStatCard, SkeletonChart, SkeletonCard } from './Skeleton';

interface GhostBentoGridProps {
  variant?: 'dashboard' | 'holdings' | 'default';
}

export function GhostBentoGrid({ variant = 'default' }: GhostBentoGridProps) {
  if (variant === 'dashboard') {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        {/* Header skeleton */}
        <div className="space-y-2 mb-8">
          <div className="shimmer h-10 w-48 rounded-lg bg-slate-800/50" />
          <div className="shimmer h-5 w-64 rounded bg-slate-800/50" />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>

        {/* Main grid */}
        <BentoGrid>
          <BentoCard span={8}>
            <SkeletonChart height={300} className="!p-0 border-none" />
          </BentoCard>
          <BentoCard span={4}>
            <SkeletonChart height={300} className="!p-0 border-none" />
          </BentoCard>
        </BentoGrid>

        {/* Holdings cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'holdings') {
    return (
      <div className="space-y-6 p-6 lg:p-8">
        {/* Header */}
        <div className="space-y-2 mb-8">
          <div className="shimmer h-8 w-32 rounded-lg bg-slate-800/50" />
          <div className="shimmer h-4 w-48 rounded bg-slate-800/50" />
        </div>

        {/* Table skeleton */}
        <div className="luma-card space-y-3">
          {/* Header row */}
          <div className="flex gap-4 p-4 border-b border-slate-700/50">
            <div className="shimmer h-4 w-24 rounded bg-slate-800/50" />
            <div className="shimmer h-4 w-20 rounded bg-slate-800/50 ml-auto" />
            <div className="shimmer h-4 w-16 rounded bg-slate-800/50" />
            <div className="shimmer h-4 w-20 rounded bg-slate-800/50" />
          </div>
          {/* Data rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="shimmer h-10 w-10 rounded-full bg-slate-800/50" />
              <div className="flex-1 space-y-1">
                <div className="shimmer h-4 w-16 rounded bg-slate-800/50" />
                <div className="shimmer h-3 w-24 rounded bg-slate-800/50" />
              </div>
              <div className="shimmer h-4 w-20 rounded bg-slate-800/50" />
              <div className="shimmer h-4 w-16 rounded bg-slate-800/50" />
              <div className="shimmer h-4 w-20 rounded bg-slate-800/50" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default grid
  return (
    <BentoGrid className="py-8">
      <BentoCard span={6}>
        <SkeletonCard className="!p-0 border-none" />
      </BentoCard>
      <BentoCard span={6}>
        <SkeletonCard className="!p-0 border-none" />
      </BentoCard>
      <BentoCard span={4}>
        <SkeletonStatCard className="!p-0 border-none" />
      </BentoCard>
      <BentoCard span={4}>
        <SkeletonStatCard className="!p-0 border-none" />
      </BentoCard>
      <BentoCard span={4}>
        <SkeletonStatCard className="!p-0 border-none" />
      </BentoCard>
    </BentoGrid>
  );
}
