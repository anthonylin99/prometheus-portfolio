'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'shimmer bg-slate-800/50',
        variantClasses[variant],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// Pre-built skeleton components
export function SkeletonText({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className="h-4"
          width={i === lines - 1 && lines > 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('luma-card space-y-4', className)}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="h-5 w-32" />
          <Skeleton variant="text" className="h-4 w-24" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn('luma-card', className)}>
      <Skeleton variant="text" className="h-3 w-20 mb-2" />
      <Skeleton variant="text" className="h-8 w-28 mb-1" />
      <Skeleton variant="text" className="h-4 w-16" />
    </div>
  );
}

export function SkeletonChart({
  className,
  height = 200,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <div className={cn('luma-card', className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton variant="text" className="h-6 w-32" />
        <Skeleton variant="text" className="h-6 w-24" />
      </div>
      <Skeleton variant="rectangular" height={height} className="w-full" />
    </div>
  );
}
